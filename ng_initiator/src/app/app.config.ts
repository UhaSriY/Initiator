
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';


@Injectable()
export class AppConfig {

    private config: any = null;
    private environment: any = null;

    constructor(private http: HttpClient) {

    }

    /**
     * Use to get the data found in the second file (config file)
     */
    public getConfig(key: any) {
        return this.config[key];
    }

    /**
     * Use to get the data found in the first file (environment file)
     */
    public getEnv(key: any) {
        return this.environment[key];
    }

    /**
     * This method:
     *   a) Loads "environment.json" to get the current working environment (e.g.: 'production', 'development')
     *   b) Loads "config.[environment].json" to get all environment's variables (e.g.: 'config.development.json')
     */
    // public load() {
    //     return new Promise((resolve, reject) => {
    //         this.http.get('environment.json').map( res => res.json() ).catch((error: any):any => {
    //             console.log('Configuration file "environment.json" could not be read');
    //             resolve(true);
    //             return Observable.throw(error.json().error || 'Server error');
    //         }).subscribe( (envResponse) => {
    //             this.environment= envResponse;
    //             let request:any = null;

    //             switch (envResponse.environment) {
    //                 case 'production': {
    //                     request = this.http.get('config.' + envResponse.environment+ '.json');
    //                 } break;

    //                 case 'development': {
    //                     request = this.http.get('config.' + envResponse.environment+ '.json');
    //                 } break;

    //                 case 'default': {
    //                     console.error('Environment file is not set or invalid');
    //                     resolve(true);
    //                 } break;
    //             }

    //             if (request) {
    //                 request
    //                     .map( res => res.json() )
    //                     .catch((error: any) => {
    //                         console.error('Error reading ' + envResponse.environment+ ' configuration file');
    //                         resolve(error);
    //                         return Observable.throw(error.json().error || 'Server error');
    //                     })
    //                     .subscribe((responseData) => {
    //                         this.config = responseData;
    //                         resolve(true);
    //                     });
    //             } else {
    //                 console.error('environmentconfig file "environment.json" is not valid');
    //                 resolve(true);
    //             }
    //         });

    //     });
    // }

    public load() {
        return new Promise((resolve,reject)=>{

            // pipe(map(res=>{})).
            this.http.get('assets/environment.json').subscribe( envResponse =>{
               
                this.environment = envResponse;
                console.log(this.environment.env)
                let request:any = null;

                switch (this.environment.env) {
                    case 'production': {
                        request = this.http.get('assets/config.' + this.environment.env+ '.json');
                    } break;

                    case 'development': {
                        request = this.http.get('assets/config.' + this.environment.env+ '.json');
                    } break;

                    case 'default': {
                        console.error('Environment file is not set or invalid');
                        resolve(true);
                    } break;
                }

                if(request){
                    request
                    // .map(res=>res.json())
                    // .catch((error:any)=>{
                    //     console.error('Error reading ' + this.environment.environment+ ' configuration file');
                    //     resolve(error);
                    // })
                    .subscribe((responseData)=>{
                        this.config = responseData;
                        resolve(true);
                    });
                }
                else{
                    console.error('environmentconfig file "environment.json" is not valid');
                    resolve(true);
                }

            });

        });
    }
}
