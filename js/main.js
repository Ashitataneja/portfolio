import { route, start } from './router.js';
import { mountColourBar } from './theme.js';
import { mountExitIntent } from './exit.js';
import { store } from './state.js';

mountColourBar(document.getElementById('colour-bar-root'));

const S = name => () => import(`./screens/${name}.js`);
route('/', S('intro'), 'intro');
route('/intro', S('intro'), 'intro');
route('/home', S('home'), 'home');
route('/navigate', S('navigate'), 'navigate');
route('/work', S('work'), 'work');
route('/work/:id', S('project'), 'project');
route('/work/:id/overview', S('overview'), 'overview');
route('/work/:id/case/:stage', S('case'), 'case');
route('/archive', S('archive'), 'archive');
route('/archive/:photo', S('filmroll'), 'filmroll');
route('/notes', S('journal'), 'journal');
route('/notes/:slug', S('article'), 'article');
route('/about', S('about'), 'about');
route('/about/profile', S('profile'), 'profile');
route('/contact', S('contact'), 'contact');
route('/postcard', S('postcard-choose'), 'postcard');
route('/postcard/:photo', S('postcard-preview'), 'postcard-preview');

// First visit of the session starts with the aperture intro; return visits land on home.
if ((!location.hash || location.hash === '#/') && store.get().introSeen) location.replace('#/home');

start();
mountExitIntent();
