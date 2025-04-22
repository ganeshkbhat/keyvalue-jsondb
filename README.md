# keyvalue-jsondb
*`fast`, `secure`, `private`, and `memory leak resistant` `in-memory` `key-value` `(closure encapsulated)` `json based` `datastore or database` that supports `http`, `https`, `ws`, `wss`, and a `command shell (without or with [todo] authentication)` and is `extendible with expressjs middlewares`*


##### indevelopment - do not use in production


please note: `redis-like` is an inference most of the shell commands are like redis but a few changes have been made to accomodate the architecture. 


- <a name="features">Features</a>
- <a name="usage">Usage</a>
- <a name="rundb">Running the Database Server</a>
  - <a name="rundbdefaults">Running the DB Server with defaults</a>
  - <a name="rundbnouserpass">Running the DB Server with no username/password</a>
  - <a name="rundbuserpass">Running the DB Server with username/password</a>
  - <a name="rundbwithoutkeys">Running the DB Server without keys</a>
  - <a name="rundbwithkeys">Running the DB Server with keys</a>
- <a name="runshell">Running the Database Shell</a>
  - <a name="runshelldefaults">Running the DB Shell with defaults</a>
  - <a name="runshellnouserpass">Running the DB Shell with no username/password</a>
  - <a name="runshelluserpass">Running the DB Shell with username/password</a>
  - <a name="runshellwithoutkeys">Running the DB Shell without keys</a>
  - <a name="runshellwithkeys">Running the DB Shell with keys</a>
- <a name="shellcommands">Shell Commands</a>
  - <a name="shellcommandsbasic">Shell Commands - Basic Usage</a>
- <a name="jsondbclient">jsondb client - client api</a>
  - <a name="jsondbclient">jsondb client - client api</a>
  - <a name="jsondbclientrequeststructures">jsondb client api request structures</a> (any language API)
- <a name="architecturedocs">Architecture Docs</a>
  - <a name="architecturedocsdesign">Basic Design - Architecture of kvjsondb</a>
  - <a name="architecturedocsstorage">kvjsondb Basic Storage</a>
- <a name="shellcommands">Shell Commands</a>
  - <a name="shellcommandsusage">Shell Commands - Basic Usage</a>
  - <a name="shellcommandsshell">jsondb shell [ commands, usage ]</a>
- <a name="jsondbclient">JSONDB Client</a>
  - <a name="jsondbclientapi">jsondb client - client api</a>
- <a name="jsondbclientrequests">JSONDB Client - request structures</a> (any language API)
- <a name="securitychecks">Security Checks and Consideration</a>
- <a name="todo">TODO</a>



#### FEATURES


- runs in `http`, or `https`, or `ws`, or `wss` (in development for tests)
- runs a `database shell` with `redis-like` commands (in development)
- has a nodejs client api. 
- use any language to make `http`, `https`, `ws`, `wss` request code to make requests as a client. 
  - the request structure is [defined here](#messagestructure) for every type of request function. 
- any programming language that supports `http`, `https`, `ws`, `wss` requests can be used as a client *[todo add request structure and parameters to docs]*

todo: add all features


#### Running/ Usage


`node db.js ...flags...`


- `node db.js` *(default, starts shell)*

- `node db.js -s "db"` 



##### ...flags...


`prefix: "-p" port [default: 4567]`

`prefix: "-t", server protocol [default: ws, will enable http and ws]`

`type options: (a) http, (b) https, (c) ws, (d) wss` (consider enabling all protocols)

`prefix: "-ip", ip address [default: 127.0.0.1]`

`prefix: "-k", key path [default: none, will enable http or ws]`

`prefix: "-c", certificate path [default: none, will enable use http or ws]`

`prefix: "-u", user [default: blank]`

`prefix: "-pwd", password [default: blank]`

`prefix: "-s", db server or shell [default: shell]`


##### defaults


- type options: `http`, `https`, `ws`, `wss` [*default: `ws`*]
- port [default: `4567` or provided custom port]
- ip [default: `127.0.0.1` / `192.168.1.1`] or provided custom ip address
- key/ cert [default: generate `public and private key pair`] 


#### Server Running/ Usage - kvjsondb


##### run database server with [a] defaults


- `node db.js -s "db"`



##### run database server with [b] with no username/password


- `node db.js -s "db" -t "type"`

- `node db.js -s "db" -p "port"`

- `node db.js -s "db" -t "type" -p "port"`

- `node db.js -s "db" -t "type" -ip "ip"`

- `node db.js -s "db" -ip "ip" -p "port"`

- `node db.js -s "db" -t "type" -p "port" -ip "ip"`



##### run database server with [c] with username/password


- `node db.js -s "db" -u "user" -p "pass"`

- `node db.js -s "db" -t "type" -u "user" -p "pass"`

- `node db.js -s "db" -t "type" -p "port" -u "user" -p "pass"`

- `node db.js -s "db" -t "type" -p "port" -ip "ip" -u "user" -p "pass"`



##### run database server with [d] without keys


- `node db.js -s "db" -t "type"`

- `node db.js -s "db" -p "port"`

- `node db.js -s "db" -ip "ip"`

- `node db.js -s "db" -t "type" -p "port"`

- `node db.js -s "db" -t "type" -ip "ip"`

- `node db.js -s "db" -p "port" -ip "ip"`

- `node db.js -s "db" -t "type" -p "port" -ip "ip"`



##### run database server with [d] with keys


- `node db.js -s "db" -t "type" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -p "port" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -ip "ip" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -t "type" -p "port" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -t "type" -ip "ip" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -p "port" -ip "ip" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -t "type" -p "port" -ip "ip" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key" -c "./fldr/cert.crt"`

- `node db.js -s "db" -t "wss" -p 4567 -ip "127.0.0.1" -k "./fldr/key" -c "./fldr/cert.crt"`



##### run shell or login to shell with [a] defaults


- `node db.js` *(default, starts shell)*



##### run shell or login to shell with [b] no username/password


- `node db.js`

- `node db.js -s "shell"`

- `node db.js -t "type"`

- `node db.js -p "port"`

- `node db.js -ip "ip"`

- `node db.js -s "shell" -t "type"`

- `node db.js -s "shell" -p "port"`

- `node db.js -s "shell" -ip "ip"`

- `node db.js -s "shell" -t "type" -p "port"`

- `node db.js -s "shell" -t "type" -ip "port"`

- `node db.js -s "shell" -p "type" -ip "port"`

- `node db.js -s "shell" -t "type" -p "port" -ip "ip"`



##### run shell or login to shell with [c] with username/password


- `node db.js -u "user" -p "pass"`

- `node db.js -t "type" -u "user" -p "pass"`

- `node db.js -p "port" -u "user" -p "pass"`

- `node db.js -ip "ip" -u "user" -p "pass"`

- `node db.js -t "type" -p "port" -u "user" -p "pass"`

- `node db.js -t "type" -ip "port" -u "user" -p "pass"`

- `node db.js -p "type" -ip "port" -u "user" -p "pass"`

- `node db.js -t "type" -p "port" -ip "ip" -u "user" -p "pass"`

- `node db.js -s "shell" -u "user" -p "pass"`

- `node db.js -s "shell" -t "type" -u "user" -p "pass"`

- `node db.js -s "shell" -p "port" -u "user" -p "pass"`

- `node db.js -s "shell" -ip "ip" -u "user" -p "pass"`

- `node db.js -s "shell" -t "type" -p "port" -u "user" -p "pass"`

- `node db.js -s "shell" -t "type" -ip "port" -u "user" -p "pass"`

- `node db.js -s "shell" -p "type" -ip "port" -u "user" -p "pass"`

- `node db.js -s "shell" -t "type" -p "port" -ip "ip" -u "user" -p "pass"`



##### run shell or login to shell with [c] certificate


- `node db.js -k "./fldr/key"`

- `node db.js -t "https" -k "./fldr/key"`

- `node db.js -t "https" -p 4567 -k "./fldr/key"`

- `node db.js -t "https" -ip "127.0.0.1" -k "./fldr/key"`

- `node db.js -p 4567 -ip "127.0.0.1" -k "./fldr/key"`

- `node db.js -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key"`

- `node db.js -s "shell" -k "./fldr/key"`

- `node db.js -s "shell" -t "https" -k "./fldr/key"`

- `node db.js -s "shell" -t "https" -p 4567 -k "./fldr/key"`

- `node db.js -s "shell" -t "https" -p 4567 -ip "127.0.0.1" -k "./fldr/key"`



### Architecture of kvjsondb - Basic Design

![Basic Design - Architecture of KVJSONDB](https://github.com/ganeshkbhat/keyvalue-jsondb/blob/main/docs/kvjsondb-json-kv-inmemory-db-architecture.jpg)


#### Architecture of kvjsondb - Basic Storage
![DB Basic Storage](https://github.com/ganeshkbhat/keyvalue-jsondb/blob/main/docs/db-basic-storage.jpg)


#### Architecture of kvjsondb - Shell Commands - Basic Usage
![Shell Commands Basic Usage](https://github.com/ganeshkbhat/keyvalue-jsondb/blob/main/docs/shell-commands-basic-usage.jpg)



### Shell [ commands, usage ] - kvjsondb 

`node db.js ...flags...`


##### Start Shell Command


`node db.js` (starts shell)

`node db.js -p 4567`

`node db.js -ip 127.0.0.1`

`node db.js -p 4567 -ip 127.0.0.1`

`node db.js -p 4567 -ip 127.0.0.1 -t wss`



##### Shell Commands


###### set
\> `set key value`

*example\>* `set test 10`


###### get
\> `get key`

*example\>* `get test`


###### has
\> `has key`

*example\>* `has test`


###### search
\> `search string`

*example\>* `search test`


###### search
\> `search -v string`

*example\>* `search -v 10`


###### search
\> `search -k string`

*example\>* `search -k test`


###### search
\> `search -kv string`

*example\>* `search -kv test`


###### load
\> `load -f filename`

*example\>* `load -f "./dump/filename.json"`


###### load
\> `load jsonobject`

*example\>* `load "{'test': 10}"`


###### read
\> `read key`

*example\>* `read test`


###### clear
\> `clear`

*example\>* `clear`


###### init
\> `init -f filename`

*example\>* `init -f "./dump/filename.json"`


###### init
\> `init jsonobject`

*example\>* `init "{'test': 10}"`


###### update
\> `update -f filename`

*example\>* `update -f "./dump/filename.json"`


###### update
\> `update jsonobject`

*example\>* `update {"test": 10}`


###### del
\> `del key`

*example\>* `del test`


###### dump
\> `dump -f "filename/within/quotes"`

*example\>* `dump -f "./dump/filename.json"`



### jsondb client - client api


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


### <a name="messagestructure">jsondb client api request structures</a>



`hasKey`

##### headers


##### body

{ event, query, options }

{ event, query, options, type }


`getKey`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`setKey`

##### headers

##### body

{ event, query = { key, value }, options }

{ event, query = { key, value }, options, type }


`updateKey`

##### headers

##### body

{ event, query = { key, value }, options }

{ event, query = { key, value }, options, type }


`delKey`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`read`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`dump`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`dumpToFile`

##### headers

##### body

{ event, query, options, type, filename }

{ event, query, options, type, filename }


`dumpKeys`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`dumpKeysToFile`

##### headers

##### body

{ event, query, options, type, filename }

{ event, query, options, type, filename }


`init`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`clear`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`load`

##### headers

##### body

{ event, query, options, type, filename }

{ event, query, options, type, filename }


`search`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`searchValue`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`searchKey`

##### headers

##### body

{ event, query, options }

{ event, query, options, type }


`searchKeyValue`

##### headers

##### body

{ event, query = { key, value }, options }

{ event, query = { key, value }, options, type }




### Security Checks and Consideration

there are possibilities for system hacks if `someDataProcessorFunction(d)` (the function that processes the data sent back from the database) processes the data from your JSON file in an unsafe manner

- Unsanitized String Interpretation 
  - issues due to Unsanitized strings especially when using using `eval()`, `child_process.exec()` with user-provided input, or similar mechanisms. 
  - this is similar to classic SQL injection vulnerability, but for code execution. 
  - Never `eval()` or `child_process.exec()` or Dynamically Execute Unsanitized String Data
- Binary Data Handling 
  - uses the binary data to construct system commands or file paths without proper validation, it could be exploited 
  - preferably, sanitize by converting to utf-8 text
  - in case of executable binary, it should not impact as much unless the data is written to a file and the file used as an executable to execute the executable
  - in case of image or video like binaries please 
- Strict Input Validation and Sanitization
- Data stored as code: 
  - Principle of Least Privilege: 
    - Ensure the Node.js process running your application has the minimum necessary permissions to perform its tasks. 
    - This limits the damage an attacker can do even if they manage to execute some code


<!-- 

1. jsondb server (http, https, ws, wss)
2. jsondb client (http, https, ws, wss)

-->

<!-- 

3. jsondb shell (http, https, ws, wss)

-->

#### TODO

add docs for other features
