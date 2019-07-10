let generate = (error,message,status,data)=>{
   return {
       error:error,
       message:message,
       status:status,
       data:data
   };
};

module.exports = {
    generate:generate
}