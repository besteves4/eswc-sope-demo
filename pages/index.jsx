/**
 * Copyright 2021 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useRef, useState } from 'react';
import DropdownTreeSelect from "react-dropdown-tree-select";
import { useSession } from "@inrupt/solid-ui-react";
import { Button } from "@inrupt/prism-react-components";
import { ListGroupItem, ListGroup } from "reactstrap";
import { getPodUrlAll, getSolidDataset, getContainedResourceUrlAll, getThing, getUrlAll } from "@inrupt/solid-client";
import { RDF, ODRL } from "@inrupt/vocab-common-rdf";
import { fetch } from "@inrupt/solid-client-authn-browser";

import personalData from "./personaldata.json";
import purpose from "./purposes.json";

const dpvpd = "https://www.w3id.org/dpv/pd#" ;
const oac = "https://w3id.org/oac/" ;
const dpv = "http://www.w3.org/ns/dpv#";

async function getDataSources(privateContainer, selectedPersonalData, selectedPurpose, selectedAccess) {
  // get list of ODRL policies
  const policiesContainer = `${privateContainer}odrl_policies/`;
  const policyDataset = await getSolidDataset(policiesContainer, { fetch: fetch });
  const policyList = getContainedResourceUrlAll(policyDataset);
  
  // get list of files in personal_data/ container
  const dataContainer = `${privateContainer}personal_data/`;
  const personalDataset = await getSolidDataset(dataContainer, { fetch: fetch });
  const personalDataFilesList = getContainedResourceUrlAll(personalDataset);
  
  const datasources = []
  for (var i = 0; i < policyList.length; i++){
    const policyPermission = await getSolidDataset( policyList[i], { fetch: fetch });
    
    // TODO: check if it is permission or prohibition
    // get triples of policy i
    const policyPermissionThing = `${policyList[i]}#permission1`
    const thing = getThing( policyPermission, policyPermissionThing);
    
    // get type of data targeted by the policy
    const targetData = getUrlAll(thing, ODRL.target);
    const pdMatches = [];
    for (var pd = 0; pd < selectedPersonalData.length; pd++){
      const pdToCompare = `${oac}${selectedPersonalData[pd]}`
      targetData.includes(pdToCompare) ? pdMatches.push(true) : pdMatches.push(false);
    }
    let pdResult = pdMatches.every((i) => { return i === true })

    // get type of access allowed by the policy
    const actionData = getUrlAll(thing, ODRL.action);
    const accessMatches = [];
    for (var a = 0; a < selectedAccess.length; a++){
      const accessToCompare = `${oac}${selectedAccess[a]}`
      actionData.includes(accessToCompare) ? accessMatches.push(true) : accessMatches.push(false);
    }
    console.log(actionData)
    console.log(accessMatches)
    let accessResult = accessMatches.every((i) => { return i === true })

    // get purposes allowed by the policy
    const purposeConstraintThing = `${policyList[i]}#purposeConstraint`
    const purposeThing = getThing( policyPermission, purposeConstraintThing);
    const purposeData = getUrlAll(purposeThing, ODRL.rightOperand);
    const purposeMatches = [];
    for (var pu = 0; pu < selectedPurpose.length; pu++){
      const purposeToCompare = `${dpv}${selectedPurpose[pu]}`
      purposeData.includes(purposeToCompare) ? purposeMatches.push(true) : purposeMatches.push(false);
    }
    let purposeResult = purposeMatches.every((i) => { return i === true })

    if(pdResult & accessResult & purposeResult){
      for (var k = 0; k < personalDataFilesList.length; k++){
        const personalDataFile = await getSolidDataset( personalDataFilesList[k], { fetch: fetch });
        const personalDataFileThing = getThing(personalDataFile, personalDataFilesList[k]);
        const targetDataURL = getUrlAll(personalDataFileThing, RDF.type);
        if(selectedPersonalData.includes(targetDataURL[0].split("#").pop())){
          !datasources.includes(personalDataFilesList[k]) ? datasources.push(personalDataFilesList[k]) : null;
        }
      }
    }
  }
  return(datasources);
}

export default function Home() {
  const { session } = useSession();
  
  const assignObjectPaths = (obj, stack) => {
    Object.keys(obj).forEach(k => {
      const node = obj[k];
      if (typeof node === "object") {
        node.path = stack ? `${stack}.${k}` : k;
        assignObjectPaths(node, node.path);
      }
    });
  };

  assignObjectPaths(personalData);
  assignObjectPaths(purpose);

  let selectedPD = []
  const handlePersonalData = (currentNode, selectedNodes) => {
    for (var i = 0; i < selectedNodes.length; i++) {
      //var value = selectedNodes[i].value;
      var label = selectedNodes[i].label;
      selectedPD.push(label);
    }
    console.log(selectedPD);
  };

  let selectedPurpose = []
  const handlePurpose = (currentNode, selectedNodes) => {
    for (var i = 0; i < selectedNodes.length; i++) {
      //var value = selectedNodes[i].value;
      var label = selectedNodes[i].label.replace(" ", "");
      selectedPurpose.push(label);
    }
    console.log(selectedPurpose);
  };

  const access = [
    { "label": "Read" },
    { "label": "Write" },
    { "label": "Append" }
  ]
  let selectedAccess = []
  const handleAccess = (currentNode, selectedNodes) => {
    for (var i = 0; i < selectedNodes.length; i++) {
      //var value = selectedNodes[i].value;
      var label = selectedNodes[i].label;
      selectedAccess.push(label);
    }
    console.log(selectedAccess);
  };

  const [display, setDisplay] = useState([]);
  const getAuthorizedDataBtn = useRef()
  const getAuthorizedData = () => {
    getPodUrlAll(session.info.webId).then(response => {
      const podRoot = response[0];
      const podPrivateContainer = `${podRoot}private/`;
      
      getDataSources(podPrivateContainer, selectedPD, selectedPurpose, selectedAccess).then(result =>{
        setDisplay(result);
      })
    }); 
  }
  
  return (
    <div class="top-container">
      {session.info.isLoggedIn &&
        <div>
          <div class="container">
            <div class="">
              <p><b>Choose type of personal data:</b></p>
              <DropdownTreeSelect data={personalData} onChange={handlePersonalData} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="">
              <p><b>Choose purpose:</b></p>
              <DropdownTreeSelect data={purpose} onChange={handlePurpose} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="">
              <p><b>Choose applicable access modes:</b></p>
              <DropdownTreeSelect data={access} onChange={handleAccess} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="bottom-container">
              <p><b></b></p>
              <Button variant="small" onClick={getAuthorizedData} ref={getAuthorizedDataBtn}>Get Data</Button>
            </div>
          </div>
          <div class="container">
            <div class="">
              <ListGroup>
                {display.map((source, index) => (
                  <ListGroupItem class="list-item" className="modal-bg">
                    <Button className="inputFont w-100" key={index}
                        onClick={() =>  navigator.clipboard.writeText(source)}>
                        {source}
                    </Button>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </div>
          </div>
        </div>       
      }
    </div>
  );
}
