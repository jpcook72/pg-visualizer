/* eslint-disable react/prop-types */
/* eslint-disable indent */
/* eslint-disable no-tabs */
import React from 'react'
import SchemaContainer from './schemaContainer.js'
import axios from 'axios'
import { Link } from 'react-router-dom'

export default class Visualizer extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            showArrows: true,
            tables: [],
            maxId: 1
        }
        this.addTable = this.addTable.bind(this)
        this.saveSchema = this.saveSchema.bind(this)
        this.handleStop = this.handleStop.bind(this)
        this.handleStart = this.handleStart.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleFieldChange = this.handleFieldChange.bind(this)
        this.addField = this.addField.bind(this)
        this.handleBelongsTo = this.handleBelongsTo.bind(this)
    }

    async componentDidMount () {
		const { schemaId } = this.props.match.params
        const startState = await axios.get(`/api/schema/${schemaId}`)
        const startTables = startState.data.length
            ? startState.data.map(table => {
                const belongsToOut = [...table.belongsTo]
                table.belongsTo = [...table.has.map(inTable => parseInt(inTable.frontId))]
                table.has = [belongsToOut.map(inTable => parseInt(inTable.frontId))]
                return table
            })
            : [
                {
                    frontId: 1,
                    name: '',
                    fields: [],
                    belongsTo: [],
                    has: [],
                    offset: 0
                }
            ]

        this.setState({
            tables: startTables,
            maxId: Math.max(...startTables.map(table => table.frontId)) + 1
        })
    }

    addTable () {
        const newTable = {
            frontId: this.state.maxId,
            name: '',
            fields: [],
            belongsTo: [],
            has: [],
            offset: this.state.tables.length * 164
        }
        this.setState({ tables: [...this.state.tables, newTable], maxId: this.state.maxId + 1 })
    }

    async saveSchema () {
        const { schemaId } = this.props.match.params
        await axios.put(`/api/schema/${schemaId}`, this.state.tables)
    }

    handleStart (e, data) {
        this.setState({ showArrows: false })
    }

    handleStop (e, data) {
        this.setState({ showArrows: true })
    }

    handleChange (evt, selectedTable) {
        const tables = this.state.tables.map(table => table === selectedTable ? { ...table, [evt.target.name]: evt.target.value } : table)
        this.setState({
            tables
        })
    }

    addField (evt, selectedTable) {
        console.log('in addField')
        const newField = { name: '', type: 'string', allowNull: true }
        const tables = [...this.state.tables.map(table => table === selectedTable ? { ...table, fields: [...table.fields, newField] } : table)]
        this.setState({ tables })
        console.log('post setstate')
    }

    handleFieldChange (evt, selectedTable, selectedField) {
        const value = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value
        const tables = [...this.state.tables.map(table =>
            table === selectedTable
                ? {
                    ...table,
                    fields: [...table.fields.map(field =>
                        field === selectedField
                            ? { ...field, [evt.target.name]: value }
                            : field)]
                }
                : table)]
        this.setState({
            tables
        })
    }

    handleBelongsTo (evt, selectedTable, otherTable) {
        const tables = [...this.state.tables.map(table => {
            if (table === selectedTable) {
                if (evt.target.checked && !otherTable.belongsTo.includes(selectedTable)) {
                    table.belongsTo = [...table.belongsTo, otherTable.frontId]
                } else {
                    table.belongsTo = [...table.belongsTo.filter(table => table.frontId !== otherTable.frontId)]
                }
            }
            if (table === otherTable) {
                if (evt.target.checked && !selectedTable.has.includes(otherTable)) {
                    table.has = [...table.has, selectedTable.frontId]
                } else {
                    table.has = [...table.belongsTo.filter(table => table.frontId !== selectedTable.frontId)]
                }
            }
            return table
        })
        ]

        this.setState({ tables })
    }

	render () {
        return (
            <div className="fullBody">
                <nav>
                    <div className="flexButtonContainer">
                        <button style={{ 'margin-right': '2px' }} onClick={this.saveSchema}><i className="far fa-save"></i></button>
                        <button style={{ 'margin-left': '2px' }} onClick={this.addTable}>+</button>
                    </div>
                    <h3>Test DB</h3>
                    <div><Link to="/"><button ><i className="fas fa-home"></i></button></Link></div>

                </nav>
                <SchemaContainer
                    state={this.state}
                    handleStop={this.handleStop}
                    handleStart={this.handleStart}
                    handleChange={this.handleChange}
                    handleFieldChange={this.handleFieldChange}
                    addField={this.addField}
                    handleBelongsTo={this.handleBelongsTo}
                />
            </div>
        )
    }
}