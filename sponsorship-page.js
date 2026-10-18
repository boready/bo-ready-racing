(()=>{const tier=new URLSearchParams(location.search).get('tier');const sel=document.querySelector('[name=package]');if(tier&&sel&&[...sel.options].some(o=>o.value===tier))sel.value=tier;})();
