Refactor the codebase 


1. to be able to be used like

```bash
import { generate, slugify, CHARSET } from 'genauid';

const id = generate();
const slug = slugify(id);
```

2. to be able to be used in any environments
3. to be tree-shakeable, so that only the functions that are used are included in the final bundle
4. to be written in TypeScript for better type safety and developer experience
5. to be used and tested without any hacks when called from testing frameworks like Jest, which may have issues with certain module formats


