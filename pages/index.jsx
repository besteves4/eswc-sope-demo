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
import Select from 'react-select';
import DropdownTreeSelect from "react-dropdown-tree-select";
import { useSession } from "@inrupt/solid-ui-react";
import { Button } from "@inrupt/prism-react-components";
/* import { createSolidDataset, createThing, setThing, addUrl, saveSolidDatasetAt, 
  getPodUrlAll, getSolidDataset, getContainedResourceUrlAll } from "@inrupt/solid-client";
import { RDF, ODRL } from "@inrupt/vocab-common-rdf";
import { fetch } from "@inrupt/solid-client-authn-browser";
import * as d3 from "d3"; */

import personalData from "./personaldata.json";
import purpose from "./purposes.json";

/* async function getPolicyFilenames(policiesContainer, filename, newPolicy) {
  const myDataset = await getSolidDataset(
    policiesContainer, {
    fetch: fetch
  });
  console.log(myDataset, newPolicy);
  const policyList = getContainedResourceUrlAll(myDataset);
  console.log(filename, policyList);

  const filenameSave = `${policiesContainer}${filename}`;
  if(policyList.includes(filenameSave)){
    alert("There is already a policy with that name, choose another");
  } else {
    try {
      await saveSolidDatasetAt(filenameSave,
        newPolicy, { fetch: fetch });
    } catch (error) {
      console.log(error);
    }
  }
} */

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
    console.log('test button');
  }

  return (
    <div>
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
              <p><b>Generate policy:</b></p>
              <Button variant="small" onClick={getAuthorizedData} ref={getAuthorizedDataBtn}>Get Data</Button>
            </div>
          </div>
        </div>        
      }
    </div>
  );
}
