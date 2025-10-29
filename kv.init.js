
const fs = require('fs');
const url = require('url');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const readline = require('readline');
const express = require('express');
const path = require("path");
const JsonManager = require("json-faster").JsonManager;
const shellflags = require("shellflags");

const manager = new JsonManager()

function shellParser(results = {}) {
    const prefixDefinitions = [
        // -t: type : http, https, ws, wss
        { prefix: "-t", handler: () => console.log },
        // -p : port : 3443, 8080, 80, 443
        { prefix: "-p", handler: (v) => Number(v) },
        // -ip : ip : ip address, url, domain name
        { prefix: "-ip", handler: () => console.log },
        // -k : key : certificate key
        { prefix: "-k", handler: () => console.log },
        // -c : cert : certificate
        { prefix: "-c", handler: () => console.log },
        // -m : mode : db, shell
        { prefix: "-m", handler: () => console.log },
        // -u : username : username for authentication
        { prefix: "-u", handler: () => console.log },
        // -pwd : password : password for authentication
        { prefix: "-pwd", handler: () => console.log },
        // -s : mode : mode of operation : shell, db
        { prefix: "-s", handler: () => console.log },
        // // -j : json config file : password for authentication
        // { prefix: "-j", handler: () => console.log }
    ];

    var results = shellflags(prefixDefinitions);
    console.log("results of shell command without default values : ", JSON.stringify(results));

    // type, port, ip/url, key, certificate, server, mode
    var middlewares = [];
    var app = (req, res, next) => { next() };

    // parsing shell and their values and applying defaults
    var type = results["-t"] = results["-t"] || "http";
    var port = results["-p"] = Number(results["-p"]) || 3443;
    var ip = results["-ip"] = results["-ip"] || "127.0.0.1";
    var key = results["-k"] = results["-k"] || null;
    var cert = results["-c"] = results["-c"] || null;
    var username = results["-u"] = results["-u"] || null;
    var password = results["-pwd"] = results["-pwd"] || null;
    var dataLoad = results["-dt"] = results["-dt"] || "{}";
    var mode = results["-s"] = results["-s"] || "shell";

    console.log("results of shell command : ", JSON.stringify(results));

    // // -j : "path to entire js file object"
    // // if all are not defined then parse json file for json object
    // if (!!results["-j"]) {
    //     try {
    //         results = { ...results, ...JSON.parse(JSON.stringify(require(results["-j"]))) }
    //     } catch (e) {
    //         results = { ...results, ...JSON.parse(JSON.stringify(require(path.join(process.cwd(), results["-j"])))) }
    //     }
    // }
    return results
}

// shellParser()

module.export = shellParser;
