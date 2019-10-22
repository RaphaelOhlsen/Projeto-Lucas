/**
 * Para rodas o arquivo tecle node index.js
 */


const axios = require('axios');

// Tive que criar este prototype pois o Node e a maioria dos browsers não tem suporte ao ES2019.
// Na relidade é só colocar este codigo
Object.defineProperty(Array.prototype, 'flat', {
  value: function(depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
    }, []);
  }
});

let state = {
  posts: [],
  baseUrl: "https://jacklyons.me/wp-json/wp/v2/posts",
  perPage: "?per_page=10",   //Aqui define o numero de posts por pagina 
  wpFetchHeaders: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "x-wp-total"
    }
  }
};

async function getNumPosts() {
  const { headers } = await axios(
    `${state.baseUrl}${state.perPage}`,
    state.wpFetchHeaders
  );
  return headers["x-wp-totalpages"];  // Nesta variavel retorna o numero de paginas que teŕa. 
                                      // Já calculado no backend, resultado da divisão do numero
                                      // de posts por pagina definido no objeto state na
                                      // propriedade perPage. No total são 39 posts e desta forma
                                      // ele divide 39 pelo perPage que no momento é 10. Então retornando
                                      // 4 da funcao getNumPosts

}

async function fetchPosts(numPages) {
  const posts = [];
  for (let page = 1; page <= numPages; page += 1) {
    const post = await axios.get(
      `${state.baseUrl}${state.perPage}&page=${page}`,
      state.wpFetchHeaders
    );
    posts.push(post);
  }

  await axios
    .all(posts)
    .then(response => {
      const postData= response.map(res => res.data)
      state.posts = postData.flat()
    }).catch(e => console.log('error fetching posts: ', e))
    return true
}

state.posts = getNumPosts()
  .then(numPosts => fetchPosts(numPosts))
  .then(() => {
    state.posts.forEach(item => {
      console.log(item)
      // document.getElementById("state").innerText = item.id;  *** Comentei esta linha pois iria dar erro pois não está 
                                                              //*** indexada ao HTML 
    });
    console.log('**************************************************');
    console.log('**************************************************');
    console.log('**************************************************');
    console.log(`São ${state.posts.length} posts no total`);
    console.log('**************************************************');
  });

console.log(fetchPosts())

