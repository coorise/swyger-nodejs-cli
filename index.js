// Run `npm run start` to start the demo
import {
    intro,
    outro,
    confirm,
    select,
    spinner,
    isCancel,
    cancel,
    text,
} from '@clack/prompts';
import { setTimeout as sleep } from 'node:timers/promises';
import color from 'picocolors';
import chalk from 'chalk';
import boxen from 'boxen';
import git from '@npmcli/git'
import fs from "fs-extra";
//visit: https://github.com/manavshrivastavagit/mycli/blob/master/bin/index.js
import {translate} from "@vitalets/google-translate-api";
import yargs from "yargs/yargs";
import {hideBin} from "yargs/helpers";
async function main() {
    let app={}
    const usage = chalk.red("\nUsage: swyger-cli init \n"
        + boxen(chalk.green("\n" + "Swyger API v0.1.0" + "\nLet's build project! \n"), {padding: 1, borderColor: 'red', dimBorder: true}) + "\n");

    //console.log(usage);
    let args=hideBin(process.argv) //Or process.argv.slice(2)

    const argv = yargs(args)
        .usage(usage)
        .command({
            command:'init',
            describe:'Init command',
            builder:function (yargs, helpOrVersionSet) {
                return yargs
                    .option('name', {
                        alias: 'n',
                        describe:'Name of the Project',
                        demandOption: false,})
                    .option('server', {
                    alias: 's',
                    describe:'Create a server Project',
                    demandOption: false,})
                    .option('client', {
                    alias: 'c',
                    describe:'Create a client Project',
                    demandOption: false,})
            },
            handler:async function(childArg){
                let arg=childArg
                console.log();
                intro(color.inverse(' create-my-app '));
                //console.log('Adding notes: ',childArg);
                if(arg.name){
                    app.name=arg.name
                }else {
                    const name = await text({
                        message: 'What is your server name?',
                        placeholder: 'swyger',
                    });

                    if (isCancel(name)) {
                        cancel('Operation cancelled');
                        return process.exit(0);
                    }
                    app.name=name
                }


                if(arg.server&&!arg.client){
                    app.sideType='server'
                }else if(!arg.server&&arg.client){
                    app.sideType='client'
                }
                else if(arg.server&&arg.client) {
                    console.log('For server: \nswyger-cli init -n swyger -s \nswyger-cli init --name swyger --server')
                    console.log('For client: \nswyger-cli init -n swyger -c \nswyger-cli init --name swyger --client')
                    return process.exit(0);
                }
                if(!app?.sideType){
                    const sideType=await select({
                        message: 'Pick your side type',
                        options: [
                            { value: 'server', label: 'Create a Backend App' },
                            { value: 'client', label: 'Create a Frontend App' },
                        ],
                    });
                    app.sideType=sideType
                }
                let projectType
                let serviceType
                let projectFolder='./'+app.name
                switch (app?.sideType) {
                    case 'server':
                        serviceType = await select({
                            message: 'Pick a service you need',
                            options: [
                                { value: 'all', label: 'All services(auth,database,storage...)' },
                                { value: 'auth', label: 'This will create only an auth server (register,login,refresh token...)' },
                                { value: 'database', label: 'This will create only a database server(create,read,update,delete data in realtime)' },
                                //{ value: 'storage', label: 'This will create only a storage server', hint: 'oh no' },
                                { value: 'storage', label: 'This will create only a storage server(create,read,update,delete file in realtime)'},
                            ],
                        });
                        if (isCancel(serviceType)) {
                            cancel('Operation cancelled');
                            return process.exit(0);
                        }
                        await git.clone('https://github.com/coorise/swyger-nodejs-base.git', 'master')?.then(()=>{
                            if(fs.pathExistsSync('./swyger-nodejs-base')){
                                if(fs.pathExistsSync('./swyger-nodejs-base/package.json')){
                                    const fileData = fs.readFileSync("./swyger-nodejs-base/package.json", "utf8")
                                    // Use JSON.parse to convert        string to JSON Object
                                    const jsonData = JSON.parse(fileData)
                                    jsonData.name='@'+app.name+'/base'
                                    // Write it back to your json file
                                    fs.writeFileSync("./swyger-nodejs-base/package.json", JSON.stringify(jsonData,null, 4))
                                }

                                fs.moveSync('./swyger-nodejs-base',projectFolder+'/server/base')
                            }
                        })

                        switch (serviceType) {
                            case 'all':
                                await git.clone('https://github.com/coorise/swyger-nodejs-auth.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-auth')){
                                        if(fs.pathExistsSync('./swyger-nodejs-auth/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-auth/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/auth'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-auth/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-auth',projectFolder+'/server/auth')
                                    }
                                })
                                await git.clone('https://github.com/coorise/swyger-nodejs-database.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-database')){
                                        if(fs.pathExistsSync('./swyger-nodejs-database/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-database/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/database'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-database/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-database',projectFolder+'/server/database')
                                    }
                                })
                                await git.clone('https://github.com/coorise/swyger-nodejs-storage.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-storage')){
                                        if(fs.pathExistsSync('./swyger-nodejs-storage/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-storage/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/storage'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-storage/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-storage',projectFolder+'/server/storage')
                                    }
                                })
                                break;
                            case 'auth':
                                await git.clone('https://github.com/coorise/swyger-nodejs-auth.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-auth')){
                                        if(fs.pathExistsSync('./swyger-nodejs-auth/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-auth/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/auth'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-auth/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-auth',projectFolder+'/server/auth')
                                    }
                                })
                                break;
                            case 'database':
                                await git.clone('https://github.com/coorise/swyger-nodejs-database.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-database')){
                                        if(fs.pathExistsSync('./swyger-nodejs-database/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-database/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/database'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-database/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-database',projectFolder+'/server/database')
                                    }
                                })
                                break;
                            case 'storage':
                                await git.clone('https://github.com/coorise/swyger-nodejs-storage.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-nodejs-storage')){
                                        if(fs.pathExistsSync('./swyger-nodejs-storage/package.json')){
                                            const fileData = fs.readFileSync("./swyger-nodejs-storage/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/storage'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-nodejs-storage/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-nodejs-storage',projectFolder+'/server/storage')
                                    }
                                })
                                break;
                        }
                        app.serviceType=serviceType
                        break;
                    case 'client':
                        projectType = await select({
                            message: 'What is the client type you want to build?',
                            options: [
                                { value: 'browser', label: 'Html/CSS SPA Boilerplate + Rest Api consumer' },
                            ],
                        });

                        if (isCancel(projectType)) {
                            cancel('Operation cancelled');
                            return process.exit(0);
                        }
                        switch (projectType) {
                            case 'browser':
                                await git.clone('https://github.com/coorise/swyger-browser.git', 'master')?.then(()=>{
                                    if(fs.pathExistsSync('./swyger-browser')){
                                        if(fs.pathExistsSync('./swyger-browser/package.json')){
                                            const fileData = fs.readFileSync("./swyger-browser/package.json", "utf8")
                                            // Use JSON.parse to convert        string to JSON Object
                                            const jsonData = JSON.parse(fileData)
                                            jsonData.name='@'+app.name+'/browser'
                                            // Write it back to your json file
                                            fs.writeFileSync("./swyger-browser/package.json", JSON.stringify(jsonData,null, 4))
                                        }
                                        fs.moveSync('./swyger-browser',projectFolder+'/client/browser')
                                    }
                                })
                                break;
                        }

                        app.projectType=projectType
                        break;
                }

                const projectUsage =chalk.red(boxen(chalk.green("\n" + app.name.toUpperCase()+" v0.1.0 project." + "\nEnter in your sub folder(s) by cmd: cd folder_name, \nthen cmd: npm install \n     cmd: npm run dev (for development) \n"), {padding: 1, borderColor: 'red', dimBorder: true}) + "\n");
                //console.log(projectUsage)
                outro("You're all set!");

                await sleep(1000);
            },
        })
        //.option("i", {alias:"init", describe: "Init a project", type: "string", demandOption: false })
        //.option("s", {alias:"sentence", describe: "Sentence to be translated", type: "string", demandOption: false })
        .showHelpOnFail(false, 'Specify --help for available options')
        .help('help')
        .argv;
    if(argv?._?.[0]!=='init'){
        console.log('The command should be: swyger-cli init')
    }


}

main().catch(console.error);
