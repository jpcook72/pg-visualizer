const router = require("express").Router()
const { Schema, Table, Field } = require('../db');
const Sequelize = require('sequelize')

router.post('/newSchema', async( req,res,next) => {
    try {
        const schemas = await Schema.findAll()
        await Promise.all(schemas.map( schema => schema.destroy()))
        await Schema.create({id: 1, key: '11111'})
        res.send('hey')
    }
    catch(err) {
        next(err)
    }
})

router.post('/schema/:schemaId', async (req, res, next) => {

    try {
        console.log('can ir')
        //this is temporary
            const schemas = await Schema.findAll()
            if (!schemas.length) await Schema.create({id: 1, key: '11111'})
        //

        const tables = await Table.findAll({
            // where: {
            //     schemaId: req.params.schemaId
            // }
        })

        const fields = await Field.findAll({  
        //     where: {
        //         tableId: {
        //             [Sequelize.Op.or]: [...tables.map(table => table.id)]
        //         }
        //   }
        })

        fields.forEach( async (field) => {
            await field.destroy();
        })

          tables.forEach( async (table) => {
            console.log('it is in')
              await table.destroy({ include: { all: true, nested: true }})
              console.log(table)
          })

        // await Promise.all([...tables.map(table => table.destroy({force: true})), ...fields.map(field => field.destroy())])
          console.log('no upe', await Table.findAll(), await Field.findAll())
        let tableArr = [];
        let fieldArr = [];
          req.body.tables.forEach( table => {
              console.log(typeof table.id, typeof Number(table.id), typeof table.id * 1, table.name, req.params.schemaId, !!table.associations ? Object.keys(table.associations).filter(key => table.associations[key]) : []);
              tableArr.push(Table.create({id: Number(table.id), name: table.name, schemaId: req.params.schemaId, associations: !!table.associations ? Object.keys(table.associations).filter(key => table.associations[key]) : []}))
          })
          console.log('made it!', tableArr, req.body.tables)
        const tableProm = await Promise.all([...tableArr])
        console.log('pst table promise', tableProm)
          req.body.tables.forEach( table => {
            table.fields.forEach( field => {
              fieldArr.push(Field.create({id: Number(field.id), name: field.name, type: field.type, allowNull: field.allowNull, tableId: table.id}))
            })
          })

        await Promise.all(fieldArr)
          console.log('down here;')

        const theSchema = await Schema.findByPk(req.params.schemaId, { include: { all: true, nested: true }})
        theSchema.tables.forEach ( (table, ind, arr) => {
            const assocArray = !!table.associations ? [...table.associations] : []
            delete table.associations;
            table.associations = {}
            arr.forEach( (inTable, inInd) => {
                if (ind != inInd) {
                    table.associations[inTable.id] = assocArray.includes(String(inTable.id))
                }
            })
        })
        res.send(theSchema)
    }
    catch(err) {
        next(err)
    }


})

router.get('/schema/:schemaId', async(req,res,next) => {
    try {
        const theSchema = await Schema.findByPk(req.params.schemaId, { include: { all: true, nested: true }})
        theSchema.tables.forEach( (table, ind, arr) => {
            const assocArray = !!table.associations ? [...table.associations] : []
            delete table.associations;
            table.associations = {}
            arr.forEach( (inTable, inInd) => {
                if (ind != inInd) {
                    table.associations[inTable.id] = assocArray.includes(String(inTable.id))
                }
            })
        })
        res.json(theSchema)

    }
    catch(err) {
        next(err)
    }
})

router.use((req, res, next) => {
    const err = new Error('API route not found!')
    err.status = 404
    next(err)
    })


module.exports = router
