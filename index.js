'use strict';
// Check RCPT TO domain is in etcd host_list

// This plugin permits relaying clients to send if
// the message is destined to or originating from a local domain.
//
// The mail hook always checks the MAIL FROM address and when detected, sets
// connection.transaction.notes.local_sender=true. During RCPT TO, if relaying
// is enabled and the sending domain is local, the receipt is OK.

const { Etcd3 } = require('../haraka-necessary-helper-plugins/etcd3');

const etcdSourceAddress = process.env.ETCD_ADDR || '127.0.0.1:2379';
const client = new Etcd3({hosts:etcdSourceAddress});

exports.register = function () {
    const plugin = this;
    
    plugin.load_host_list();

    this.register_hook('rcpt', 'rcpt');
    this.register_hook('mail', 'mail');
}

exports.load_host_list = function () {
  const plugin = this;

  var lowered_list = {};
  plugin.host_list = lowered_list;

  client.get('config_host_list').string()
  .then(raw_list => {
    if (raw_list) {
      const list = raw_list.split(',');
      
      for (const i in list) {
        lowered_list[list[i].trim().toLowerCase()] = true;
      }

      plugin.host_list = lowered_list;
    }
    else console.log("Something went wrong while reading config_host_list from Etcd");
  });

  client.watch()
    .key('config_host_list')
    .create()
    .then(watcher => {
      watcher
        .on('disconnected', () => console.log('disconnected...'))
        .on('connected', () => console.log('successfully reconnected!'))
        .on('put', res => {
          lowered_list = {};
          const list = res.value.toString().split(',');
          for (const i in list) {
            lowered_list[list[i].trim().toLowerCase()] = true;
          }
          plugin.host_list = lowered_list;
          console.log("Host list is updated!");
        });
    });

}


exports.rcpt = function (next, connection, params) {
    const plugin = this;
    const txn = connection.transaction;
    if (!txn) return;

    var rcpt = params[0];
    if (connection.notes.aliased) rcpt = connection.notes.aliased;


    // Check for RCPT TO without an @ first - ignore those here
    if (!rcpt.host) {
        txn.results.add(plugin, {fail: 'rcpt!domain'});
        return next();
    }

    connection.logdebug(plugin, `Checking if ${rcpt} host is in host_list`);

    const domain = rcpt.host.toLowerCase();

    if (plugin.in_host_list(domain)) {
        txn.results.add(plugin, {pass: 'rcpt_to'});
        if(connection.notes.rcptOriginal) 
          return next(OK, `recipient ${connection.notes.rcptOriginal} OK`);
        return next(OK);
    }

    // in this case, a client with relaying privileges is sending FROM a local
    // domain. For them, any RCPT address is accepted.
    if (connection.relaying && txn.notes.local_sender) {
        txn.results.add(plugin, {pass: 'relaying local_sender'});
        return next(OK);
    }

    // the MAIL FROM domain is not local and neither is the RCPT TO
    // Since this plugin must be the last rcpt_to plugin running on the plugins list, deny.
    txn.results.add(plugin, {msg: 'rcpt!local'});
    return next(DENY, "Cannot deliver mail for this domain.");
}

exports.in_host_list = function (domain) {
  const plugin = this;
  plugin.logdebug(`checking ${domain} in host_list`);
  if (plugin.host_list[domain]) {
      return true;
  }
  return false;
}

exports.mail = function (next, connection, params) {
  const plugin = this;
  const txn = connection.transaction;
  if (!txn) { return; }

  const email = params[0].address();
  if (!email) {
      txn.results.add(plugin, {skip: 'mail_from.null', emit: true});
      return next();
  }

  var domain = params[0].host.toLowerCase();
  if (connection.notes.aliased) domain = connection.notes.aliased.host.toLowerCase();

  const anti_spoof = plugin.config.get('host_list.anti_spoof') || false;

  if (plugin.in_host_list(domain)) {
      if (anti_spoof && !connection.relaying) {
          txn.results.add(plugin, {fail: 'mail_from.anti_spoof'});
          if(connection.notes.rcptOriginal) 
            return next(DENY, `Mail from domain '${connection.notes.rcptOriginal.host.toLowerCase()}' is not allowed from your host`);
          return next(DENY, `Mail from domain '${domain}' is not allowed from your host`);
      }
      txn.results.add(plugin, {pass: 'mail_from'});
      txn.notes.local_sender = true;
      return next();
  }

  txn.results.add(plugin, {msg: 'mail_from!local'});
  return next();
}