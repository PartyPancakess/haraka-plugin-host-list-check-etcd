[![NPM][npm-img]][npm-url]

# haraka-plugin-host-list-check-etcd

This host_list plugin uses "etcd" to check the domains that are local to the host and determines whether the incoming email will be rejected or not, based on this list.

For more information, please check the original plugin(host_list_regex is not included): https://haraka.github.io/manual/plugins/rcpt_to.in_host_list.html


## Example etcd Configuration
```
etcdctl put config/domains/host_list "test.com, example.com"
```




<!-- leave these buried at the bottom of the document -->
[npm-img]: https://nodei.co/npm/haraka-plugin-host-list-check-etcd.png
[npm-url]: https://www.npmjs.com/package/haraka-plugin-host-list-check-etcd
