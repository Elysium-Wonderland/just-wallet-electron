import db_constants from "../constants/db";

function openIndexedDB(object, key) {
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    let openDB = indexedDB.open(db_constants.WALLET_SCHEMA, 1);

    openDB.onupgradeneeded = function () {
        let db = {};
        db.result = openDB.result;
        db.store = db.result.createObjectStore(object, {keyPath: key});
    };
    return openDB;
}

function getStoreIndexedDB(openDB, object) {
    let db = {};
    db.result = openDB.result;
    db.tx = db.result.transaction(object, "readwrite");
    db.store = db.tx.objectStore(object);

    return db;
}

function saveIndexedDB(object, key, doc) {
    return new Promise((resolve) => {
        let openDB = openIndexedDB(object, key);

        openDB.onsuccess = function () {
            let db = getStoreIndexedDB(openDB, object);
            let result = db.store.put(doc);
            resolve(result);
        };

        return true;
    });
}

function findIndexedDB(object, key, id, callback) {
    return loadIndexedDB(object, key, id, callback);
}

function getAll(object, key) {
    return new Promise((resolve, reject) => {
        let openDB = openIndexedDB(object, key);
        openDB.onsuccess = function () {
            let db = getStoreIndexedDB(openDB, object);

            let getData = db.store.getAll(id);

            getData.onsuccess = function () {
                resolve(getData.result);
            };

            getData.onerror = function () {
                reject(getData.result);
            };

            db.tx.oncomplete = function () {
                db.result.close();
            };
        };
    });


    // return true;
}

function loadIndexedDB(object, key, id) {
    return new Promise((resolve, reject) => {
        let openDB = openIndexedDB(object, key);

        openDB.onsuccess = function () {
            let db = getStoreIndexedDB(openDB, object);

            let getData;
            if (id) {
                getData = db.store.get(id);
            }

            getData.onsuccess = function () {
                resolve(getData.result);
            };

            getData.onerror = function () {
                reject(getData.result);
            };

            db.tx.oncomplete = function () {
                db.result.close();
            };
        };
        return true;
    })


}


export default {
    saveIndexedDB,
    findIndexedDB,
    getAll
}
