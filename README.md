# keyvalue-jsondb
*fast, secure and private, memory leak resistant redis like key value json based data store or database that supports http, https, ws, wss, and command shell (without authentication) and is extendible with expressjs middlewares*


##### indevelopment - do not use in production


#### FEATURES


- runs in `http`, `https` (in development for tests)
- runs in `ws`, `wss` (in development for tests)
- runs a `database shell` with `redis like` commands (in development)
- has a nodejs client api. 
- any programming language `http`, `https`, `ws`, `wss` request can be used as a client *[todo add request structure and parameters]*

todo: add all features


### jsondb server usage


##### login to shell with defaults and non username/password
`node server.js -t "type" -p "port" -ip "ip" -k "key" -c "cert"`

`node server.js -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key" -c "./fldr/cert.crt"`

`node server.js -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key" -c "./fldr/cert.crt" -s "db"`

##### login to shell with defaults and non username/password
`node server.js -s "shell"`

##### login to shell with defaults and non username/password
`node server.js -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key" -s "shell"`


type options: `http`, `https`, `ws`, `wss`
port options: 4567
ip default: `127.0.0.1` / `192.168.1.1` or provided ip address
key/ cert default: generate public and private key pair  

##### Basic Design - Architecture of kvjsondb

![Basic Design - Architecture of KVJSONDB](https://github.com/ganeshkbhat/keyvalue-jsondb/blob/main/kvjsondb-json-kv-inmemory-db-architecture.jpg)


##### Shell Commands Basic Usage
![Shell Commands Basic Usage](https://github.com/ganeshkbhat/keyvalue-jsondb/blob/main/shell-commands-basic-usage.jpg)

### jsondb client api

```

var client = new ClientAPI(ipURL, options, type = "http")
// nodejs http request options/ options: {host, port, headers, path, method, ...}
// type options: `http`, `https`, `ws`, `wss`
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

`node shell.js ...flags...`

##### ...flags...

```
// prefix: "-p" port [default: 4567]
// prefix: "-t", server protocol type options: `http`, `https`, `ws`, `wss` (consider enabling all protocols)
// prefix: "-ip", ip address [default: 127.0.0.1]
// prefix: "-k", key path [default: none, will use http or ws]
// prefix: "-c", certificate path [default: none, will use http or ws]
// prefix: "-u", user [default: blank]
// prefix: "-pwd", password [default: blank]
// prefix: "-s", db server or shell [default: shell]
```



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

#### TODO

add docs for other features
