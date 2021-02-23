[![Unix Build Status][ci-img]][ci-url]
[![Windows Build Status][ci-win-img]][ci-win-url]
[![Code Climate][clim-img]][clim-url]
[![NPM][npm-img]][npm-url]

# haraka-plugin-host-list-check-etcd

This host_list plugin uses "etcd" to check the domains that are local to the host and determines whether the incoming email will be rejected or not, based on this list.

For more information, please check the original plugin(host_list_regex is not included): https://haraka.github.io/manual/plugins/rcpt_to.in_host_list.html


## Example etcd Configuration
```
etcdctl put config/mta/host_list "korumail.tk, test.com, example.com"
```




<!-- leave these buried at the bottom of the document -->
[ci-img]: https://github.com/haraka/haraka-plugin-host-list-check-etcd/workflows/Plugin%20Tests/badge.svg
[ci-url]: https://github.com/haraka/haraka-plugin-host-list-check-etcd/actions?query=workflow%3A%22Plugin+Tests%22
[ci-win-img]: https://github.com/haraka/haraka-plugin-host-list-check-etcd/workflows/Plugin%20Tests%20-%20Windows/badge.svg
[ci-win-url]: https://github.com/haraka/haraka-plugin-host-list-check-etcd/actions?query=workflow%3A%22Plugin+Tests+-+Windows%22
[clim-img]: https://codeclimate.com/github/haraka/haraka-plugin-host-list-check-etcd/badges/gpa.svg
[clim-url]: https://codeclimate.com/github/haraka/haraka-plugin-host-list-check-etcd
[npm-img]: https://nodei.co/npm/haraka-plugin-host-list-check-etcd.png
[npm-url]: https://www.npmjs.com/package/haraka-plugin-host-list-check-etcd
