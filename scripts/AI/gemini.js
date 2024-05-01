
// Import the file module.
// import file from `./net.js`;

const texts = (await import(chrome.runtime.getURL("scripts/mapping/read.js"))).default;

// Don't forget to set the class as export default.
export default class gemini {
    #key;
    #request;

    /* Set the model to use.

    @param {string} key the API key. Remember to not commit your API keys.
    @param {string} model the model to use
    @param {object} version the API and bot version
    */
    constructor (key, model, version = {"API": "v1beta"}) {
        if ((key) ? (((typeof key).includes(`str`)) ? !(key.trim()) : true) : true) {
            throw new ReferenceError((new texts(`error_msg_APImissing`)).localized);
        };

        // Register the API key privately.
        this.#key = key.trim();

        // Create the headers for future interaction.
        this.#request = {}
        this.#request[`headers`] = {
            "Content-Type": "application/json",
            "x-goog-api-key": this.#key
        };

        this.model = {};
        // Set the model. If not provided, use the default of gemini-pro. Make sure to determine if "models/" was accidentally included, which is really part of the URL and not the model name itself.
        this.model[`name`] = ((typeof model).includes(`str`) && model) ? ((model.includes(`models/`)) ? model : `models/`.concat(model)) : 'gemini-pro';

        // Set the request location.
        this.#request[`location`] = `https://generativelanguage.googleapis.com/${((version != null && !Array.isArray(version) && (typeof version).includes(`obj`)) ? version[`API`] : false) ? version[`API`] : `v1beta`}/${this.model.name}`;
    };


    /* Ask Google Gemini.

    @param {object} prompt the prompts; may accept a string to be converted to an object; images should already be blob
    @param {boolean} continued whether to continue the existing prompt
    */
    async generate(prompt, safetySettings, generationConfig, continued = false) {
        let create = async () => {
            let REQUEST = {}, PROMPT = [];

            if ((typeof prompt) != `object`) {
                PROMPT.push({"text": String(prompt)});
            } else if (Array.isArray(prompt)) {
                while (PROMPT.length < prompt.length) {
                    if ((typeof prompt[PROMPT.length]).includes(`obj`) && prompt[PROMPT.length] != null && !Array.isArray(prompt[PROMPT.length])) {
                        PROMPT.push(prompt[PROMPT.length]);
                    } else {
                        PROMPT.push({"text": prompt[PROMPT.length]});
                    }
                }
            } else if (typeof prompt == `object` && prompt != null && !Array.isArray(prompt)) {
                PROMPT.push(prompt);
            };

            REQUEST[`contents`] = [];

            // Function below by Google (https://ai.google.dev/tutorials/get_started_web)
            async function fileToGenerativePart(image) {
                image = {"blob": image};
                image[`type`] = image[`blob`].type;

                const reader = new FileReader();
                image[`base64`] = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(image[`blob`]);
                });
                    
                return {inlineData: { data: image[`base64`], mimeType: image[`type`] }};
            };

            while (REQUEST[`contents`].length < PROMPT.length) {
                let MESSAGE = {};


                // Add the role.
                MESSAGE[`role`] = (PROMPT[REQUEST[`contents`].length][`role`]) ? PROMPT[REQUEST[`contents`].length][`role`] : `user`;
                MESSAGE[`parts`] = [];


                // Convert the photos to a list if it isn't set to be one.
                if (PROMPT[REQUEST[`contents`].length][`images`] ? !Array.isArray(PROMPT[REQUEST[`contents`].length][`images`]) : false) {
                    PROMPT[REQUEST[`contents`].length][`images`] = [PROMPT[REQUEST[`contents`].length][`images`]];
                }

                // Add the photos, which are already in the blob format. 
                while ((PROMPT[REQUEST[`contents`].length][`images`]) ? (MESSAGE[`parts`].length < PROMPT[REQUEST[`contents`].length][`images`].length) : false) {
                    let MESSAGE_IMAGE = await fileToGenerativePart(PROMPT[REQUEST[`contents`].length][`images`][MESSAGE[`parts`].length]);
                    if (MESSAGE_IMAGE) {
                        MESSAGE[`parts`].push();
                    }
                };

                // Add the message.
                MESSAGE[`parts`].unshift({"text": PROMPT[REQUEST[`contents`].length][`text`]});

                // Add the message itself.
                REQUEST[`contents`].push(MESSAGE);
            };

            // Add the continuation.
            if (continued && Object.keys(this).includes(`history`)) {
                // Merge the two lists.
                REQUEST[`contents`] = [...this[`history`], ...REQUEST[`contents`]];
            }

            // Add the additional configuration.
            if (safetySettings) {
                REQUEST[`safetySettings`] = safetySettings;
            }
            if (generationConfig) {
                REQUEST[`generationConfig`] = generationConfig;
            }

            return REQUEST;
        }

        let send = async (REQUEST) => {
            // Send the request.
            let CONNECT = await fetch(this.#request[`location`].concat(`:generateContent`), {method: `POST`, headers: this.#request[`headers`], body: JSON.stringify(REQUEST)});

            if (CONNECT.ok) {
                let RESPONSE = await CONNECT.json();
                if (Object.keys(RESPONSE).includes(`error`)) {
                    throw new Error(RESPONSE[`error`]);
                } else {
                    this.response = RESPONSE;
                    return RESPONSE;
                }
            } else {
                throw new Error(`The request failed.`);
            }
        }

        /* Analyze the response. */
        let analyze = (RESPONSE_RAW) => {
            let RESPONSES = [];

            // Delete previous block state, if any. 
            delete this.blocked;

            while (RESPONSES.length < RESPONSE_RAW[`candidates`].length && !this.blocked) {
                this.blocked = RESPONSE_RAW[`candidates`][RESPONSES.length][`safetyRatings`][`blocked`];

                // Check if the response is blocked.
                if (!this.blocked && RESPONSE_RAW[`candidates`][RESPONSES.length][`content`]) {
                    let RESPONSE_CURRENT = [];

                    let RESPONSES_RAW_ALL = RESPONSE_RAW[`candidates`][RESPONSES.length][`content`][`parts`];
                    while (RESPONSE_CURRENT.length < RESPONSES_RAW_ALL.length) {
                        RESPONSE_CURRENT.push(String(RESPONSES_RAW_ALL[RESPONSE_CURRENT.length][`text`]));
                    }

                    // Add the item to this response.
                    RESPONSES.push(RESPONSE_CURRENT.join());

                    // Add the response to the history.
                    if (!Object.keys(this).includes(`history`)) {this[`history`] = []}
                    this[`history`].concat(RESPONSE_RAW[`candidates`][RESPONSES.length - 1][`content`]);
                }
            }

            if (RESPONSES.length > 0) {
                // Merge the responses.
                this.candidate = RESPONSES.join();
            }

            return (this.candidate);
        }

        let REQUEST = await create();
        let RESPONSE_RAW = await send(REQUEST);
        return(analyze(RESPONSE_RAW));
    }
};
