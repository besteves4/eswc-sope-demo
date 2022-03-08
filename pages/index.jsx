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

import React, {useRef} from 'react';
import DropdownTreeSelect from "react-dropdown-tree-select";
import { useSession } from "@inrupt/solid-ui-react";
import { Button } from "@inrupt/prism-react-components";
import { createSolidDataset, createThing, setThing, addUrl, saveSolidDatasetAt, 
  getPodUrlAll, getSolidDataset, getContainedResourceUrlAll, getThing, getUrlAll } from "@inrupt/solid-client";
import { RDF, ODRL } from "@inrupt/vocab-common-rdf";
import { fetch } from "@inrupt/solid-client-authn-browser";


import personalData from "./personaldata.json";
import purpose from "./purposes.json";

async function getPolicyFilenames(privateContainer, selectedPersonalData, selectedPurposes, selectedAccess) {
  const policiesContainer = `${privateContainer}odrl_policies/`;
  const policyDataset = await getSolidDataset(
    policiesContainer, {
    fetch: fetch
  });
  console.log(policyDataset);
  const policyList = getContainedResourceUrlAll(policyDataset);
  console.log(policyList);

  const dataContainer = `${privateContainer}personal_data/`;
  const personalDataset = await getSolidDataset(
    dataContainer, {
    fetch: fetch
  });
  console.log(personalDataset);
  const personalDataFilesList = getContainedResourceUrlAll(personalDataset);

  for (var i = 0; i < policyList.length; i++){
    const policyPermission = await getSolidDataset( policyList[i], { fetch: fetch });
    console.log(policyPermission);
    const policyPermissionThing = `${policyList[i]}#permission1`
    const thing = getThing( policyPermission, policyPermissionThing);
    console.log(thing);
    const targetData = getUrlAll(thing, ODRL.target);
    for (var j = 0; j < selectedPersonalData.length; j++) {
      const pdToCompare = `https://w3id.org/oac/${selectedPersonalData[j]}`
      if(pdToCompare.localeCompare(targetData)){
        for (var k = 0; k < personalDataFilesList.length; k++){
          if(personalDataFilesList[k].endsWith(`${selectedPersonalData[j]}`)){
            alert(`Access authorised to file stored at ${personalDataFilesList[k]}`)
          }
        }
      }
    }
  }
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
      var label = selectedNodes[i].label;
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

  const getAuthorizedDataBtn = useRef();
  const getAuthorizedData = () => {

    getPodUrlAll(session.info.webId).then(response => {
      const podRoot = response[0];
      const podPrivateContainer = `${podRoot}private/`;
      getPolicyFilenames(podPrivateContainer, selectedPD, selectedPurpose, selectedAccess);
    });
  }

  return (
    <div>
      {!session.info.isLoggedIn &&
        <div class="logged-out">
          Demonstrator used to simulate an app request for personal data and the respective response
        </div>
      }
      {session.info.isLoggedIn &&
        <div>
          <div class="logged-in">
            Demonstrator used to simulate an app request for personal data and the respective response
          </div>
          <div class="container">
            <div class="" style="text-align: center;">
              <p><b>Choose type of personal data:</b></p>
              <DropdownTreeSelect data={personalData} onChange={handlePersonalData} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="" style="text-align: center;">
              <p><b>Choose purpose:</b></p>
              <DropdownTreeSelect data={purpose} onChange={handlePurpose} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="" style="text-align: center;">
              <p><b>Choose processing Activities:</b></p>
              <DropdownTreeSelect data={access} onChange={handleAccess} className="tree-select"/>
            </div>
          </div>
          <div class="container">
            <div class="bottom-container" style="text-align: center;">
              <Button variant="small" value="permission" onClick={getAuthorizedData} ref={getAuthorizedDataBtn}>Execute</Button>
            </div>
          </div>
        </div>        
      }
    </div>
  );
}
