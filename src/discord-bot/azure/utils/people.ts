import nlp from "compromise/three";
import { capitalize } from "lodash";
import config from "../config/people";

nlp.addWords(config);

const getAuthor = (action: string, capitalizeResponse = true): string => {
  const doc = nlp(action);
  const author = doc.people().text();

  if (!capitalizeResponse) return author;

  return capitalize(author);
};

export default getAuthor;
