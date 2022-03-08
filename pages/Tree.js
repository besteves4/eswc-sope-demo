import React from "react";
import Tree from "react-d3-tree";

const debugData = [
  {
    name: "GrapqlAPI",
    children: [
      {
        name: "Query",
        children: [
          {
            name: "gameProducts"
          },
          {
            name: "game",
            children: [
              {
                name: "id"
              },
              {
                name: "description"
              },
              {
                name: "slug"
              },
              {
                name: "products",
                children: [
                  {
                    name: "items",
                    children: [
                      {
                        name: "id"
                      },
                      {
                        name: "name"
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

const containerStyles = {
  width: "100%",
  height: "100vh"
};

const svgSquare = {
  shape: "rect",
  shapeProps: {
    width: 20,
    height: 20,
    x: -10,
    y: -10,
    fill: 'red',
  }
};

export default class CenteredTree extends React.PureComponent {
  state = {};

  componentDidMount() {
    const dimensions = this.treeContainer.getBoundingClientRect();
    this.setState({
      translate: {
        x: dimensions.width / 10,
        y: dimensions.width / 3
      }
    });
  }

  handleClick(nodeData, event){
    console.log(nodeData.data.name);
    console.log(nodeData, event);
  }

  render() {
    return (
      <div style={containerStyles} ref={(tc) => (this.treeContainer = tc)}>
        <Tree
          data={debugData}
          translate={this.state.translate}
          orientation={"horizontal"}
          nodeSvgShape={svgSquare}
          rootNodeClassName="node__root"
          branchNodeClassName="node__branch"
          leafNodeClassName="node__leaf"
          onNodeClick = {this.handleClick.bind(this)}
        />
      </div>
    );
  }
}
