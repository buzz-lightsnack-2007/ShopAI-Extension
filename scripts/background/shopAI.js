/* ShopAI
Shop wisely with AI!
*/

import fc from './fc.js';
import BackgroundCheck from "./background.check.js";
import BackgroundMessaging from "./background.messaging.js";

fc.run();
BackgroundCheck.init();
new BackgroundMessaging();