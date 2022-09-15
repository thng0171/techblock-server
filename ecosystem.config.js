module.exports = {
  apps : [{
    name   : "app",
    script : "./index.js",
    watch: ["server", "client"],
    watch_delay: 1000,
    ignore_watch : ["node_modules", "server/uploads"],
  }]
}
