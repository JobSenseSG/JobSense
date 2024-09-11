import { registerStore } from "@wordpress/data";

import reducer from "./reducer";
import * as actions from "./actions";
import * as selectors from "./selectors";

registerStore("quillForms-fileblock", {
    actions,
    reducer,
    selectors
});
