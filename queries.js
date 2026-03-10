
const { GraphQLClient, gql } = require('graphql-request');



//////////////////////////////////////////////////////////////////////// AUTH
const login = gql`mutation getToken($id:String!, $pwd:String!){
  login(input: { identifier: $id, password: $pwd }) {
    jwt
  }
}` ;

const me = gql`query {
	me{
		id
		email
    username
	}
}`;

const user = gql`query getUserByID($id:ID = 1){
  usersPermissionsUser(id: $id){
    data{
      id
      attributes{
        email
        username
      }
    }
  }
}` ;
//////////////////////////////////////////////////////////////////////// END AUTH



//////////////////////////////////////////////////////////////////////// LANG
const langs = gql`query {
  i18NLocales{
    data{
			id
      attributes{
        code
				name
      }
    }
  }
}`;
//////////////////////////////////////////////////////////////////////// END LANG




//////////////////////////////////////////////////////////////////////// NAVIGATION
const children = gql`
query childOf($parentID: ID!) {
  sections(filters: {parent:{id:{eq:$parentID}}}) {
    data {
      id
      attributes {
        label
        name
      }
    }
  }
}` ;

const sections = gql`
query sections($level:Int=1){
	sections(sort: "id", filters:{level:{eq:$level}}) {
		data {
			id
			attributes {
				
        label
        name
				level
        
        children{
          data{
            id
						attributes{
							name
              page{
                data{
                  id
                }
              }
						}
          }
        }
        parent{
					data{
						id
						attributes{
              label
							name
						}
					}
				}
				page{
					data{
						id
						attributes{
							
							template{
								data{
									id
									attributes{
										name
                    behavior
									}
								}
							}
						}
					}
				}
			}
		}
	}
}`
;

const section = gql`query section($id:ID=1){
  section(id: $id){
    data{
      id
      attributes{
        label
        name
        level
        path
        
        parent{
          data{
            id
            attributes{
              name
            }
          }
        }
        children{
          data{
            id
            attributes{
              label
              name
            }
          }
        }
        page{
          data{
            id
            attributes{
              
              template{
                data{
                  id  
                }
                
              }
              
            }
          }
        }
      }
    }
  }
}`
;

//////////////////////////////////////////////////////////////////////// END NAVIGATION



//////////////////////////////////////////////////////////////////////// PAGE

const page = gql`query page($id:ID=1){
  page(id: $id){
    data{
      id
      attributes{
        
        template{
          data{
            id
            attributes{
              name
            }  
          }
        }
      }
    }
  }
}`
;

//////////////////////////////////////////////////////////////////////// END PAGE


/*
///////////////////////////////////// OLD
let sectionsfull = gql`query {
  sections( sort: "level"){
    data{
      id
      attributes{
        name
        level
        path
        parent{
          data{
            id
            attributes{
              name
            }
          }
        }
        behavior{
          data{
            attributes{
              step
            }
          }
        }
        post{
          data{
            id
            attributes{
              name
              localizations{
                data{
                  id
                  attributes{
                    locale
                  }
                }
              }
              template{
                data{
                  id
                  attributes{
                    name
                    uri
                  }
                }
              }
              brackets{
                ... on ComponentPostsArticle{
                  __typename
                  title
                  data
                  template
                }
              }
              locale
            }
          }
        }
      }
    }
  }
}`
;


let posts = gql`query {
  posts(sort: "name"){
    data{
      id
      attributes{
        name
      }
    }
  }
}`;

let post = gql`query getPost($id: ID!){
  post(id: $id){
    data{
      id
      attributes{
        name
        localizations{
          data{
            id
            attributes{
              locale
            }
          }
        }
        template{
          data{
            id
            attributes{
              name
              uri
            }
          }
        }
        brackets{
          ... on ComponentPostsArticle{
            __typename
            title
            data
            template
          }
        }
        locale
      }
    }
  }
}`;
///////////////////////////////////// END OLD
*/




module.exports = {
  login:login,
  user:user,
  me:me,
  
  langs:langs,

  
  children:children,
  section:section,
  sections:sections,
  
  page:page,
  
  /*
  sectionsfull:sectionsfull,
  posts:posts,
  post:post,
  */
}


