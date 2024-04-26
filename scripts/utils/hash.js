
export default class hash {
     static async digest (DATA, OPTIONS) {
          DATA = {"raw": DATA};
          DATA[`hashed`] = await(crypto.subtle.digest(((OPTIONS != null && (typeof OPTIONS).includes(`obj`) && !Array.isArray(OPTIONS)) ? OPTIONS[`digestion`] : false) ? OPTIONS[`digestion`] : "SHA-512", (new TextEncoder()).encode(DATA[`raw`])));

          if ((OPTIONS != null && (typeof OPTIONS).includes(`obj`) && !Array.isArray(OPTIONS)) ? OPTIONS[`output`] : false) {
               switch (OPTIONS[`output`]) {
                    case `Uint8Array`:
                         DATA[`converted`] = new Uint8Array(DATA[`hashed`]);
                         break;
                    case `Array`: 
                         DATA[`converted`] = Array.from(new Uint8Array(DATA[`hashed`]));
                         break;
                    case `Number`: 
                         DATA[`converted`] = parseInt((Array.from(new Uint8Array(DATA[`hashed`]))).join());
                         break;
               };
          }

          return ((DATA[`converted`]) ? DATA[`converted`] : DATA[`hashed`]);	
     };
}