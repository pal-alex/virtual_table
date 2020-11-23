import VirtualTable from './table';
import renderer from 'react-test-renderer';

import {shallow, mount, render} from 'enzyme';
import { getByText } from '@testing-library/react';


it("renders correctly", () => {
    const table = renderer.create(
        <VirtualTable rows = {100} cols = {10} />
    ).toJSON();
    expect(table).toMatchSnapshot()
});

it("needs to update rows", () => {
    const props0 = {
        rows: 100,
        cols: 10,
        rowHeight: 30,
        clientHeight: 600,
        startRow: 1,
        finishRow: 0,
        skipDidMount: true
    }
    const wrapper0 = shallow(<VirtualTable {...props0} />)
    expect(wrapper0.instance().needToUpdate(0, 600)).toBe(true);

    const props1 = {
        startRow: 11,
        finishRow: 50
    }
    const wrapper1 = shallow(<VirtualTable {...props0} {...props1} />)
    let state = wrapper1.instance().state
    expect(state.startRow).toEqual(11)
    expect(state.finishRow).toEqual(50)
    expect(state.clientHeight).toEqual(600)
    expect(state.rowHeight).toEqual(30)

    expect(wrapper1.instance().needToUpdate(299, 600)).toBe(true)
    expect(wrapper1.instance().needToUpdate(300, 600)).toBe(false)
    expect(wrapper1.instance().needToUpdate(900, 600)).toBe(false)
    expect(wrapper1.instance().needToUpdate(901, 600)).toBe(true)


    const props2 = {
        startRow: 61,
        finishRow: 100,
    }
    const wrapper2 = shallow(<VirtualTable {...props0} {...props2} />)
    expect(wrapper2.instance().needToUpdate(1799, 600)).toBe(true)
    expect(wrapper2.instance().needToUpdate(1800, 600)).toBe(false)
    expect(wrapper2.instance().needToUpdate(3000, 600)).toBe(false)
    expect(wrapper2.instance().needToUpdate(3001, 600)).toBe(false)
    
});


it("has the right number of children", () => {
    const props = {
        rows: 100,
        cols: 10,
        rowHeight: 30,
        clientHeight: 600
    }
    const table = mount(<VirtualTable {...props} />)
    expect(table.find("tbody").children().length).toEqual(42) //20*2 + 1 - rows + 1 bottom empty

})

it("has the right number of children and expected values after scrolling", () => {
    const props = {
        rows: 100,
        cols: 10,
        rowHeight: 30,
        clientHeight: 600
    }
    const table = mount(<VirtualTable {...props} />)
    table.find('#container_virtual_table').simulate("scroll", {target: {scrollTop: 400, clientHeight: 600}})
    expect(table.find("tbody").children().length).toEqual(42) 
    expect(table.find("tbody td").at(0).text()).toEqual("R1C1")
    expect(table.find("tbody td").at(10).text()).toEqual("R2C1")
    expect(table.find("tbody td").at(400).text()).toEqual("R41C1")
    
    expect(table.find("tbody td").contains("R1C1")).toEqual(true)
    expect(table.find("tbody td").contains("R42C1")).toEqual(false)

    table.find('#container_virtual_table').simulate("scroll", {target: {scrollTop: 800, clientHeight: 600}})
    expect(table.find("tbody").children().length).toEqual(43) // + 1 top empty

    expect(table.find("tbody td").contains("R15C1")).toEqual(false)
    expect(table.find("tbody td").contains("R16C1")).toEqual(true)
    expect(table.find("tbody td").at(0).text()).toEqual("R16C1")
})


it("has the right number of empties", () => {
    const props = {
        rows: 1000000,
        cols: 10,
        rowHeight: 30,
        clientHeight: 600
    }
    const table = mount(<VirtualTable {...props} />)

    expect(table.find("tbody").children().length).toEqual(44)
    expect(table.find(".empty").length).toEqual(3)

})