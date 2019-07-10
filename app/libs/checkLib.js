//Trim a perticular string
let trim = (stringValue)=>{
   return String(stringValue).replace(/^\s+|\s+$/gm,'');
}

let isEmpty = (value)=>{
  if(value === null || value === undefined || value.length === 0 || trim(value) === ''){
     return true;
  }else{
   return false;
  }
  
}

module.exports = {
    isEmpty: isEmpty
}