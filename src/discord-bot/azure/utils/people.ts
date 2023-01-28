import nlp from 'compromise/three'
import config from "../config/people.js"
import captalize from './captalize.js'

nlp.addWords(config)

const getAuthor = (action: string, captalizeResponse = true): string => {
  const doc = nlp(action)
  const author = doc.people().text()

  if(!captalizeResponse) return author

  return captalize(author)
}

export default getAuthor