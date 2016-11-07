"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const React = require("react");
const { shallow } = require("enzyme");

describe("Shallow Rendering API", () => {
  describe(".find(selector) => ShallowWrapper", () => {
    it("ツリーを探索 (全探索)", () => {
      const wrapper = shallow(
        <div id="1">
          <div id="2"/>
          <div id="3">
            <div id="4"/>
          </div>
          <div id="5"/>
        </div>
      );
      const elems = wrapper.find("div");

      assert(elems.length === 5);
    });

    it("nodeは指定できない", () => {
      const wrapper = shallow(
        <div id="1">
          <div id="2"/>
          <div id="3">
            <div id="4"/>
          </div>
          <div id="5"/>
        </div>
      );
      const elems = wrapper.find(<div id="4"/>);

      assert(elems.length === 0);
    });

    it("Reactコンポーネントは探索されない", () => {
      `
      コンポーネント化されているということは単体テストの範囲外とみなされる
      `
      class A extends React.Component {
        render() { return <B/> }
      }
      class B extends React.Component {
        render() { return <div id="n"/> }
      }
      const wrapper = shallow(
        <div id="1">
          <A/><A/><A/><A/>
        </div>
      );

      const elems = wrapper.find("div");

      assert(elems.length === 1);
    });

    it("Reactコンポーネントは名前で探索できる", () => {
      class A extends React.Component {
        render() { return <div/> }
      }
      const wrapper = shallow(
        <div>
          <A id="1"/><A id="2"/><A id="3"/><A id="4"/>
        </div>
      );

      const elems = wrapper.find("A");

      assert(elems.length === 4);
    });
  });

  describe(".findWhere(predicate) => ShallowWrapper", () => {
    it("深さ優先探索", () => {
      const wrapper = shallow(
        <div id="1">
          <div id="2"/>
          <div id="3">
            <div id="4"/>
          </div>
          <div id="5"/>
        </div>
      );
      const spy = sinon.spy();

      wrapper.findWhere(x => spy(x.prop("id")));

      const order = spy.args.map(x => x[0]);

      assert.deepEqual(order, [ "1", "2", "3", "4", "5" ]);
    });
  });

  describe(".filter(selector) => ShallowWrapper", () => {
    it("current wrapperを検索 (深さ1)", () => {
      const wrapper = shallow(
        <div id="1">
          <div id="2"/>
          <div id="3">
            <div id="4"/>
          </div>
          <div id="5"/>
        </div>
      );
      const elems = wrapper.children().filter("div");

      assert(elems.length === 3);
    });
  });

  describe(".contains(nodeOrNodes) => Boolean", () => {
    it("find().length と似ているけど、nodeを指定できる", () => {
      const wrapper = shallow(
        <div id="1">
          <div id="2"/>
          <div id="3">
            <div id="4"/>
          </div>
          <div id="5"/>
        </div>
      );
      const actual = wrapper.contains(<div id="4"/>);

      assert(actual === true);
    });
  });

  describe(".render() => CheerioWrapper", () => {
    it("renderするとReactコンポーネントも展開(?)される", () => {
      class A extends React.Component {
        render() { return <B/> }
      }
      class B extends React.Component {
        render() { return <div id="n"/> }
      }
      const wrapper = shallow(
        <div id="1">
          <A/><A/><A/><A/>
        </div>
      );

      const elems = wrapper.render().find("div");

      assert(elems.length === 5);
    });
  });

  describe(".instance() => ReactComponent", () => {
    it("instanceof React.Component したいとき", () => {
      class A extends React.Component {
        render() { return <div/> }
      }
      const wrapper = shallow(<A/>);

      assert(wrapper.instance() instanceof A);
    });
  });

  describe(".type() => String|Function|null", () => {
    it("ノードが複数あるとエラーになる", () => {
      const wrapper = shallow(
        <div><a/><b/><i/></div>
      );

      assert(wrapper.type() === "div");

      assert.throws(() => {
        wrapper.children().type();
      });

      assert(wrapper.childAt(0).type() === "a");
    });
  });
});
