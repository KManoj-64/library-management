const API_ROOT = '/api';

async function api(path, opts = {}){
  const res = await fetch(API_ROOT + path, opts);
  return res.json();
}

export { api };
