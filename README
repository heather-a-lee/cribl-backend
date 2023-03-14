# Cribl Take Home Project

Hi there! Thanks for taking the time to review my project. This is an Express server which offers one endpoint to expose logs in the /var/log folder:

- `/api/v0/logs?filename=<filename>,keyword=<keyword>,n=<n>`

where filename is a required query parameter, and keyword and n are both optional parameters. `keyword` gives the ability to filter results based on if a log line includes a particular string, while `n` returns all the last `n` matches for a given keyword (or the last `n` lines if no keyword is provided). For example, for a request like

- `/api/v0/logs?filename=<filename>,n=<n>`

should give the same response data as what `tail -n <n> <filename>` should return.

Querying with both `n` and `keyword` will try to find the `keyword` from the logs in the `n` most recent occurrences.

This was tested on a file that was ~1.5GB. In order to ensure that we were not serving huge amounts of data back in an API response, and serve only a reasonable amount of content, I've capped the API responses to ~20MB which takes around 5-8 seconds to load. This is really generous and I picked this number because there are browser limits to how much data can be loaded before crashing Chrome. Given that logs that are more recent are more likely to be searched in terms of UX and that our endpoint reads from the end of the log file as the starting point, it makes the search significantly faster to only search through a subset of content.

To account for this, and the possibility that the log lines that we are searching for with a keyword could extend beyond this capacity, there is an additional query parameter `byteOffset` which can be used to start at a different byte offset (there is also a log printing what offset we left off on previously -- I tried to write this to the request headers but that was a bit buggy since I'm also returning the API response in chunks, where the API response header is `Transfer-Encoding: chunked`). My vision long term for this might be that we could use this information in the UI and stitch together the various responses we get by promisifying requests to the API endpoint at different byte offsets.

To run this project in production mode:

```
yarn build
yarn start:prod
```

or alternatively development mode:

```
yarn start:dev
```

and to run unit tests associated with these features, please run:

```
yarn test
```

### Notes

- There's quite a few other options I wish I could have explored when working on this project. For instance, I could have probably optimized on the I/O where if I used more promises and batched some of them, I could take more advantage of the event loop.
