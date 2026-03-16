/* 
This file is for page specific logic (reading/modifying DOM). This
will contain our core logic for extracting text (detecting scams).
*/

console.log("Content Script Loaded");

//Script to extract all text from DOM and log it to console
//Creating a function to extract test from current DOM

function extractText(){
    const text = document.body.innerText;
    console.log(text);
}

//load the initial text from the DOM

extractText();

//creating a mutation observer to watch for changes in the DOM
let last_url = location.href

new MutationObserver(() =>{
        if (location.href !== last_url){
            last_url = location.href
            extractText();
        }
    }
).observe(document, {childList:true, subtree:true});