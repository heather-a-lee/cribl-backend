import { Transform } from "stream";
import boyerMooreSearch from "../search/boyerMooreSearch";

class BoyersMooreSearchFilter extends Transform {
  searchTerm: string;

  constructor(searchTerm: string) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
    this.searchTerm = searchTerm;
  }

  _transform(chunk: string, _: any, next: any) {
    if (this.includesSearchTerm(chunk)) {
      return next(null, chunk);
    }

    next();
  }

  includesSearchTerm(chunk: string) {
    // console.log("i am in includes search term");
    console.log(boyerMooreSearch(chunk.toString(), this.searchTerm));
    console.log(boyerMooreSearch(chunk.toString(), this.searchTerm) !== -1);

    return boyerMooreSearch(chunk.toString(), this.searchTerm) !== -1;
  }
}

export default BoyersMooreSearchFilter;
