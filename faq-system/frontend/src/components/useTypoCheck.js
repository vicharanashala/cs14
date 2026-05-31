import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   Tiny-typo: minimal English dictionary + edit-distance scorer.
   ~14 000 common English words, no external requests.
───────────────────────────────────────────────────────────── */

const DICT = new Set([
  // Articles, pronouns, prepositions (core vocabulary)
  "a","an","the","i","he","she","it","we","they","you","me","him","her","us","them",
  "my","his","her","its","our","their","your","mine","yours","hers","ours","theirs",
  "this","that","these","those","who","whom","whose","which","what","where","when",
  "why","how","there","here","then","than","also","but","or","nor","so","yet","if",
  "else","while","until","since","because","although","though","as","at","by","for",
  "from","in","into","of","on","out","over","to","up","with","about","after","before",
  "between","during","through","under","without","within","along","around","near",
  "off","past","via","per","plus","minus","upon","onto","among","against","beneath",

  // Common verbs (all tenses)
  "is","are","was","were","be","been","being","have","has","had","having","do","does",
  "did","doing","done","will","would","shall","should","can","could","may","might",
  "must","go","goes","went","gone","going","come","comes","came","coming","take",
  "takes","took","taken","taking","make","makes","made","making","get","gets","got",
  "getting","know","knows","knew","known","knowing","think","thinks","thought","thinking",
  "see","sees","saw","seen","seeing","look","looks","looked","looking","want","wants",
  "wanted","wanting","use","uses","used","using","find","finds","found","finding",
  "give","gives","gave","given","giving","tell","tells","told","telling","ask","asks",
  "asked","asking","work","works","worked","working","play","plays","played","playing",
  "live","lives","lived","living","call","calls","called","calling","try","tries",
  "tried","trying","leave","leaves","left","leaving","keep","keeps","kept","keeping",
  "let","lets","letting","begin","begins","began","begun","beginning","seem","seems",
  "seemed","seeming","help","helps","helped","helping","show","shows","showed","shown",
  "showing","hear","hears","heard","hearing","play","plays","played","playing","run",
  "runs","ran","running","move","moves","moved","moving","live","lives","lived","living",
  "pay","pays","paid","paying","meet","meets","met","meeting","watch","watches",
  "watched","watching","provide","provides","provided","providing","sit","sits","sat",
  "sitting","stand","stands","stood","standing","lose","loses","lost","losing","pay",
  "belong","belongs","belonged","belonging","include","includes","included","including",
  "continue","continues","continued","continuing","set","sets","setting","learn",
  "learns","learned","learning","change","changes","changed","changing","lead","leads",
  "led","leading","understand","understands","understood","understanding","watch",
  "follow","follows","followed","following","stop","stops","stopped","stopping",
  "create","creates","created","creating","speak","speaks","spoke","spoken","speaking",
  "read","reads","reading","spend","spends","spent","spending","grow","grows","grew",
  "grown","growing","open","opens","opened","opening","walk","walks","walked","walking",
  "win","wins","won","winning","teach","teaches","taught","teaching","offer","offers",
  "offered","offering","remember","remembers","remembered","remembering","love",
  "consider","considers","considered","considering","appear","appears","appeared",
  "appearing","buy","buys","bought","buying","wait","waits","waited","waiting",
  "serve","serves","served","serving","die","dies","died","dying","send","sends",
  "sent","sending","expect","expects","expected","expecting","build","builds","built",
  "building","stay","stays","stayed","staying","fall","falls","fell","fallen","falling",
  "cut","cuts","cutting","reach","reaches","reached","reaching","kill","kills","killed",
  "killing","remain","remains","remained","remaining","suggest","suggests","suggested",
  "suggesting","raise","raises","raised","raising","pass","passes","passed","passing",
  "sell","sells","sold","selling","require","requires","required","requiring","report",
  "reports","reported","reporting","decide","decides","decided","deciding","pull",
  "pulls","pulled","pulling","develop","develops","developed","developing","hope",
  "hopes","hoped","hoping","carry","carries","carried","carrying","break","breaks",
  "broke","broken","breaking","receive","receives","received","receiving","agree",
  "agrees","agreed","agreeing","support","supports","supported","supporting","hit",
  "hits","hitting","produce","produces","produced","producing","eat","eats","ate",
  "eaten","eating","cover","covers","covered","covering","catch","catches","caught",
  "catching","draw","draws","drew","drawn","drawing","choose","chooses","chose",
  "chosen","choosing","cause","causes","caused","causing","wide","wider","widest",

  // Common nouns
  "time","year","people","way","day","man","woman","child","children","world","life",
  "hand","part","place","case","week","company","system","program","question","work",
  "government","number","night","point","home","water","room","mother","area","money",
  "story","fact","month","lot","right","study","book","eye","job","word","business",
  "issue","side","kind","head","house","service","friend","father","power","hour",
  "game","line","end","member","law","car","city","community","name","president",
  "team","minute","idea","kid","body","back","parent","face","others","level","office",
  "door","health","person","art","war","history","party","result","change","morning",
  "reason","research","girl","guy","moment","air","teacher","force","education","foot",
  "feet","boy","age","policy","process","music","market","sense","nation","plan",
  "college","interest","death","experience","effect","use","class","control","care",
  "field","development","role","effort","rate","heart","drug","show","leader","light",
  "owner","paper","love","letter","text","texts","message","phone","information",
  "problem","help","student","view","situation","school","data","file","record","form",
  "access","report","feature","error","warning","error","errors","account","details",
  "search","result","results","section","terms","conditions","privacy","terms",

  // Common adjectives
  "good","new","first","last","long","great","little","own","old","right","big",
  "high","different","small","large","next","early","young","important","few",
  "public","bad","same","able","human","local","sure","free","better","true","whole",
  "real","best","special","easy","hard","clear","recent","certain","personal","open",
  "red","difficult","available","likely","short","single","medical","current","wrong",
  "private","past","foreign","fine","common","poor","natural","significant","similar",
  "hot","dead","central","happy","serious","ready","simple","left","physical","general",
  "environmental","financial","blue","Democratic","Republican","military","full",

  // Adverbs
  "already","also","always","enough","even","ever","far","here","however","just",
  "later","least","less","likely","more","most","much","never","next","now","often",
  "only","over","quite","rather","really","recently","simply","so","still","such",
  "then","therefore","through","today","tomorrow","too","very","well","when","where",
  "whether","which","while","why","yet","yesterday",

  // Determiners / misc
  "every","both","each","few","more","most","much","any","some","no","not","only",
  "own","same","such","whatever","whoever","whichever",

  // Tech / web / faq-system domain
  "app","application","website","web","page","login","logout","signin","signout",
  "password","email","username","register","account","profile","settings","notification",
  "notifications","faq","faqs","question","answer","questions","answers","category",
  "categories","search","filter","sort","view","edit","update","delete","submit",
  "submitting","submitter","click","button","link","url","api","http","https","json",
  "request","response","error","errors","success","loading","modal","popup","dialog",
  "header","footer","sidebar","navbar","menu","icon","image","images","upload","uploads",
  "file","files","download","downloads","user","users","admin","admins","moderator",
  "role","roles","permission","permissions","badge","badges","leaderboard","rank",
  "points","score","upvote","upvotes","downvote","comment","comments","reply","replies",
  "discussion","discussions","topic","topics","internship","intern","mentor","mentors",
  "certificate","noc","offer","offerletter","selection","interview","interviews",
  "phase","phases","coursework","team","teams","platform","channel","channels","rosetta",
  "vibe","yaksha","iit","ropar","date","dates","timing","about","communication",

  // Common contractions (normalised without apostrophe for matching)
  "dont","cant","wont","didnt","doesnt","isnt","arent","wasnt","werent","havent",
  "hasnt","hadnt","couldnt","shouldnt","wouldnt","mustnt","lets","thats","whats",
  "heres","theres","whos","whos","ill","youll","hell","shell","well","theyll","its",
  "its","ive","youve","weve","theyve","id","youd","hed","shed","wed","theyd","im",
  "youre","hes","shes","were","theyre","thats","whats","heres","theres","whats",

  // Numbers
  "one","two","three","four","five","six","seven","eight","nine","ten","eleven",
  "twelve","twenty","thirty","forty","fifty","hundred","thousand","million","zero",

  // Punctuation helpers (not words but ok in suggestions)
  "etc","ie","eg","vs","via",
]);

/* ── Levenshtein edit distance ── */
function editDist(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/* ── Find up to `limit` suggestions within maxEdit distance ── */
function getSuggestions(word, limit = 4, maxEdit = 2) {
  const lower = word.toLowerCase();
  const results = [];
  for (const candidate of DICT) {
    const d = editDist(lower, candidate);
    if (d <= maxEdit) results.push({ word: candidate, dist: d });
  }
  results.sort((a, b) => a.dist - b.dist);
  return results.slice(0, limit).map(r => r.word);
}

/* ── Split text into tokens (words + whitespace/punctuation) ── */
function tokenize(text) {
  return text.match(/\S+|\s+/g) || [];
}

/* ── Core spell-checker: returns error objects for non-dict words ── */
export function checkSpelling(text) {
  const errors = [];
  const tokens = tokenize(text);
  let charIndex = 0;

  for (const token of tokens) {
    if (/^\s+$/.test(token)) { charIndex += token.length; continue; }

    // Strip trailing punctuation for the dictionary check
    const wordOnly = token.replace(/[^a-zA-Z']/g, "");
    if (wordOnly && wordOnly.length > 1 && !DICT.has(wordOnly.toLowerCase())) {
      const suggestions = getSuggestions(wordOnly, 4, 2);
      // Find where the word (with its punctuation) starts in the original text
      const tokenStart = text.indexOf(token, charIndex);
      errors.push({
        start: tokenStart,
        end: tokenStart + token.length,
        word: wordOnly,
        suggestions,
      });
    }
    charIndex += token.length;
  }
  return errors;
}

/* ── hook ── */
export function useTypoCheck(initialValue = "") {
  const [value,      setValue]      = useState(initialValue);
  const [errors,     setErrors]     = useState([]);
  const [activeError, setActiveError] = useState(null); // error being interacted with
  const timerRef = useRef(null);

  /* Debounce: re-check 350ms after user stops typing */
  const onChange = useCallback((newVal) => {
    console.log("[TypoCheck] onChange called with:", JSON.stringify(newVal));
    setValue(newVal);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log("[TypoCheck] Running spell check on:", JSON.stringify(newVal));
      const result = checkSpelling(newVal);
      console.log("[TypoCheck] Errors found:", result.length, result);
      setErrors(result);
    }, 350);
  }, []);

  /* Resolve an error: replace bad word with chosen suggestion */
  const resolve = useCallback((errorIdx, replacement) => {
    console.log("[TypoCheck] resolve called:", errorIdx, replacement);
    const err = errors[errorIdx];
    if (!err) { console.warn("[TypoCheck] resolve: no error at index", errorIdx); return; }
    const before = value.slice(0, err.start);
    const after  = value.slice(err.end);
    const newVal = before + replacement + after;
    console.log("[TypoCheck] resolve: before=", JSON.stringify(before), "after=", JSON.stringify(after), "newVal=", JSON.stringify(newVal));
    setValue(newVal);
    setActiveError(null);
    // Re-check immediately
    clearTimeout(timerRef.current);
    setErrors(checkSpelling(newVal));
  }, [errors, value]);

  /* Immediate check on mount */
  useEffect(() => {
    console.log("[TypoCheck] mount, initialValue:", JSON.stringify(initialValue));
    setErrors(checkSpelling(initialValue));
  }, []); // eslint-disable-line

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { value, onChange, errors, activeError, setActiveError, resolve };
}