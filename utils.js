let formatHashes ;
module.exports = {
  formatHashes : formatHashes = (arr, parent) => {
    parent = parent || '/' ;
    let l = arr.length ;
    for (let i = 0; i < l; i++) {
      let child = arr[i] ;
      child.path = parent + child.name + '/' ;
      if (!!child.children && !!child.children.length)
        formatHashes(child.children, child.path) ;
    }

    return arr ;
  }
}