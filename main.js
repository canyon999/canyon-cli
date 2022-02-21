#! /usr/bin/env node
const program = require('commander')
const fs = require('fs')
const nyc = require('nyc')
const exec = require('child_process').exec

program.version('1.0.3')

program
    .command('instrument')
    .argument('<first>', 'string argument')
    .argument('[second]', 'string argument')
    .action((first, second) => {
        // 读取环境变量创建canyon.json文件
        const {CI_COMMIT_SHA,CI_PROJECT_ID,REPORTER,DSN} = process.env
        const canyonJson = {
            repoId:CI_PROJECT_ID||'-',
            commitSha:CI_COMMIT_SHA||'-',
            dsn:DSN||'-',
            reporter:REPORTER||'-',
            codeHouseId:'1',
            instrumentCwd: process.cwd()
        }
        fs.writeFile('./canyon.json', JSON.stringify(canyonJson), (error) => {
            // 创建失败
            if(error){
                console.log(`[ Canyon ] 创建失败：${error}`)
            }
            // 创建成功
            console.log(`[ Canyon ] canyon.json创建成功！`)


            // 插桩代码
            exec(`nyc instrument ${first} ${second} && cp -rf ./${second}/* ./${first} && rm -rf ./${second}`, function(error, stdout, stderr) {
                if (error) {
                    console.error('error: ' + error);
                    return;
                }
            })
            console.log('[ Canyon ] 插桩成功！')
        })

    })

program.parse(process.argv);
