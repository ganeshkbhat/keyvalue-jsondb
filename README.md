# keyvalue-jsondb
fast, secure and private, memory leak resistant redis like key value json based data store or database that supports http, https, ws, wss, and command shell (without authentication) and is extendible with expressjs middlewares


### jsondb server usage

`node server.js "type" "port" "ip" "key" "cert"`

options: `http`, `https`, `ws`, `ws`

### jsondb client api

```

var client = new ClientAPI(ipURL, options, type = "http")
// request options/ options: `http`, `https`, `ws`, `ws`
// // msg/ message = { event, query, options }
// // msg/ message = { event, query = { key, value }, options }
// // msg/ message = { event, query, options, type }
// // msg/ message = { event, query, options, type, filename } // dumpToFile, dumpKeysToFile

client.hasKey(msg, opts)
client.getKey(msg, opts)
client.setKey(msg, opts)
client.updateKey(msg, opts)
client.delKey(msg, opts)
client.read(msg, opts)
client.dump(msg, opts)
client.dumpToFile(msg, opts)
client.dumpKeys(msg, opts)
client.dumpKeysToFile(msg, opts)
client.init(msg, opts)
client.clear(msg, opts)
client.load(msg, opts)
client.search(msg, opts)
client.searchValue(msg, opts)
client.searchKey(msg, opts)
client.searchKeyValue(msg, opts)

```

### jsondb shell [ commands, usage ]

`node shell.js`

###### set
\> `set key value`

###### get
\> `get key`

###### has
\> `has key`

###### search
\> `search string`

###### search
\> `search -v string`

###### search
\> `search -k string`

###### search
\> `search -kv string`

###### load
\> `load -f filename`

###### load
\> `load jsonobject`

###### read
\> `read key`

###### clear
\> `clear`

###### init
\> `init -f filename`

###### init
\> `init jsonobject`

###### update
\> `update -f filename`

###### update
\> `update jsonobject`

###### del
\> `del key`

###### dump
\> `dump -f "filename/within/quotes"`



<!-- 

1. jsondb server (http, https, ws, wss)
2. jsondb client (http, https, ws, wss)

-->

<!-- 

3. jsondb shell (http, https, ws, wss)

-->
