import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Storage, SqlStorage } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as PouchDB from 'pouchdb';

/*
  Generated class for the Clientservice provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ClientService {
  data: any;
  db: any;
  remote: any;
  username: any;
  password: any;

  constructor(private http: Http) {

    this.db = new PouchDB('cloudo');
    this.username = 'surnialleareauslowitharm';
    this.password = '71302fd0fb26de84161a65b8c68cfed38bf19bbb';
    this.remote = 'https://dedmeades1.cloudant.com/clients/_all_docs';

    let options = {
      live: true,
      retry: true,
      continuous: true,
      auth: {
        username: this.username,
        password: this.password
      }
    };

    this.db.sync(this.remote, options);
  }

  getClients() {

    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {
      this.db.allDocs({
        include_docs: true
      }).then((result) => {
        this.data = [];
        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });
        resolve(this.data);
        this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
          this.handleChange(change);
        });
      }).catch((error) => {
        console.log(error);
      });
    });
  }

  createClient(client) {
    this.db.post(client);
  }

  updateClient(client) {
    this.db.put(client).catch((err) => {
      console.log(err);
    });
  }

  deleteClient(client) {
    this.db.remove(client).catch((err) => {
      console.log(err);
    });
  }

  handleChange(change) {

    let changedDoc = null;
    let changedIndex = null;

    this.data.forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }
    });

    //A document was deleted
    if (change.deleted) {
      this.data.splice(changedIndex, 1);
    }
    else {
      //A document was updated
      if (changedDoc) {
        this.data[changedIndex] = change.doc;
      }
      //A document was added
      else {
        this.data.push(change.doc);
      }
    }
  }

}

