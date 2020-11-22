import './table.css';
import React, { Component } from 'react';


export default class VirtualTable extends Component {
    constructor(props) {
        super();

        if (props.data) {
            this.state = {
                rows: props.data.length,
                cols: props.data.length > 0 ? props.data[0].length : props.cols,
                data: props.data
            }
        }
        else {
            this.state = {
                rows: props.rows,
                cols: props.cols,
                data: this.generate_data(props.rows, props.cols)
            }
        }

        this.state.clientHeight = props.clientHeight ? props.clientHeight : null
        this.state.headerHeight = props.headerHeight ? props.headerHeight : 40
        this.state.rowHeight = props.rowHeight ? props.rowHeight : 30
        this.state.scrollTop = 0
        this.state.coef = props.coef && props.coef > 2 ? props.coef : 2 //how many screens of rows need to fill
        this.state.startRow = props.startRow ? props.startRow : 1
        this.state.finishRow = props.finishRow ? props.finishRow : 0
        this.state.skipDidMount = props.skipDidMount ? props.skipDidMount : false

        this.onScroll = this.onScroll.bind(this)
    }

    componentDidMount() {
        // console.log(this.container.id + ' did mount. Current clientHeight=' + this.state.clientHeight + ', containerHeight=' + this.container.clientHeight)
        if (this.container && this.container.clientHeight !== 0) {
            this.setUpdateInfo(0, this.container.clientHeight)
        }else if ( !(this.state.clientHeight === 0 || this.state.skipDidMount) ) {
            this.setUpdateInfo(0, this.state.clientHeight)
        }
    }

    generate_data(rows, cols) {
        let data = []
        for (let i = 0; i < rows; i++) {
            let row = []
            for (let j = 0; j < cols; j++) {
                row.push(`R${i + 1}C${j + 1}`)
            }
            data.push(row)
        }
        return data;
    }

    renderHeader() {
        let cells = [];
        for (let i = 0; i < this.state.cols; i++) {
            cells.push(<th key={i}>{`Column ${i + 1}`}</th>)
        }

        return <tr key={-1} className="header" style={{ "height": this.state.headerHeight }}>{cells}</tr>
    }

    render_virtual_body() {
        // console.log('rendering virtual body...')
        let table = [...this.render_empty(this.state.offsetTop, 's'), ...this.render_real_rows(this.state.startRow, this.state.finishRow), ...this.render_empty(this.state.offsetBottom, 'f')]
        return table
    }

    render_body() {
        return this.render_real_rows(1, this.state.rows)
    }

    render_empty(offset, key_prefix) {
        let empties = []
        let offset0 = offset;
        if (offset0 > 0) {
            // there is a limit of the max possible height for a div
            const maxHeight = 10000000
            let key = 1
            while (offset0 > 0) {
                let offsetHeight = Math.min(maxHeight, offset0)
                empties.push(<tr key={`${key_prefix}${key}`} className="empty" style={{ "height": `${offsetHeight}px` }}></tr>)
                offset0 = offset0 - offsetHeight
                key++
            }
        }
        return empties
    }

    render_real_rows(startRow, finishRow) {
        // console.log('render real rows startRow=' + startRow + ' finishRow=' + finishRow)
        let table = [];
        for (let i = startRow - 1; i < finishRow; i++) {
            // console.log('i=' + i + ' data=' + this.state.data[i])
            table.push(this.render_row(this.state.data[i], i))
        }
        return table
    }

    render_row(row, key) {
        let cells = [];
        for (let i = 0; i < this.state.cols; i++) {
            cells.push(<td key={i}>{`${row[i]}`}</td>)
        }
        return <tr key={key} className="row border" style={{ "height": this.state.rowHeight }}>{cells}</tr>
    }

    setUpdateInfo(scrollTop, clientHeight) {
        let startRow = 1,
            finishRow = 0,
            offsetTop = 0,
            offsetBottom = 0

        let needToFill = Math.trunc(clientHeight / this.state.rowHeight) * (this.state.coef - 1)
        if (scrollTop > 0) {
            startRow = Math.max(Math.trunc(scrollTop / this.state.rowHeight) - Math.trunc(needToFill / 2), 1)
        }

        finishRow = Math.min(startRow + needToFill * 2, this.state.rows)
        
        offsetTop = (startRow - 1) * this.state.rowHeight
        offsetBottom = (this.state.rows - finishRow) * this.state.rowHeight

        this.setState({
            scrollTop: scrollTop,
            clientHeight: clientHeight,
            offsetTop: offsetTop,
            startRow: startRow,
            finishRow: finishRow,
            offsetBottom: offsetBottom
        })
    }

    onScroll = (evt) => {
        let target = evt.target
        let scrollTop = target.scrollTop
        let clientHeight = target.clientHeight
        let needToUpdate = this.needToUpdate(scrollTop, clientHeight)
        if (needToUpdate) {
            this.setUpdateInfo(scrollTop, clientHeight)
        }
    }

    isInside(scrollTop, scrollBottom) {
        return scrollTop >= (this.state.startRow - 1) * this.state.rowHeight &&
               (scrollBottom <= this.state.finishRow * this.state.rowHeight || this.state.finishRow >= this.state.rows)
    }

    needToUpdate(scrollTop, clientHeight) {
        let scrollBottom = scrollTop + clientHeight;

        return  !this.isInside(scrollTop, scrollBottom) ||
                (this.state.startRow === 1 && this.state.finishRow === 0) || 
                clientHeight !== this.state.clientHeight 
                
    }

    renderTable() {
        return (
            <table id="virtual_table" className="virtual_table">
                <thead>
                    {this.renderHeader()}
                </thead>
                <tbody>
                    {this.render_virtual_body()}
                </tbody>
            </table>
        )
    }

    render() {
        const clientHeight = this.state.clientHeight;
        let style = clientHeight ? {height: `${clientHeight}px`} : {}
        return (
            <div id="container_virtual_table" ref={el => (this.container = el)} className="container border" style={style} onScroll={this.onScroll}>
                {clientHeight && this.renderTable()}
            </div>
        )
    }
} 


