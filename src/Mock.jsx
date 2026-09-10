import { useState, useEffect, useRef, useCallback } from "react";

/* ---------------------------------------------------------
   QUESTION BANK
   Format per question: [id, questionText, [4 options], correctIndex, explanation]
--------------------------------------------------------- */

const RAW_REASONING = [
["r1","Find the missing number in the series: 4, 9, 16, 25, 36, ?",["47","48","49","50"],2,"The series is squares of consecutive numbers: 2², 3², 4², 5², 6², 7² = 49."],
["r2","Find the missing number: 5, 11, 23, 47, 95, ?",["189","190","191","193"],2,"Each term = previous × 2 + 1, so 95 × 2 + 1 = 191."],
["r3","Find the missing number: 3, 8, 15, 24, 35, ?",["46","47","48","50"],2,"Pattern n(n+2): 1×3, 2×4, 3×5, 4×6, 5×7, 6×8 = 48."],
["r4","Find the missing number: 2, 6, 12, 20, 30, ?",["40","42","44","45"],1,"Pattern n(n+1): 1×2, 2×3 ... 6×7 = 42."],
["r5","Find the missing number: 100, 90, 81, 73, 66, ?",["58","59","60","61"],2,"Differences decrease by 1 each time: -10,-9,-8,-7,-6, so 66-6=60."],
["r6","Find the missing number: 3, 6, 12, 24, 48, ?",["92","94","96","98"],2,"Each term is double the previous term: 48 × 2 = 96."],
["r7","In a code, TEACHER is written as UFBDIFS (each letter shifted +1). How is STUDENT written in the same code?",["TUVEFOU","TUVEFOT","TUVDFOU","TUWEFOU"],0,"Shift each letter of STUDENT forward by one place."],
["r8","In a certain code, ROSE is written as 6821, CHAIR is written as 73456, and PREACH is written as 961473. What is the code for SEARCH?",["214673","216473","214763","241673"],0,"Assign R=6, O=8, S=2, E=1, C=7, H=3, A=4; then code S-E-A-R-C-H."],
["r9","If A=1, B=2 ... Z=26, and each letter's number is increased by 3 (wrapping after Z), what does CAT become?",["FDW","FDX","EDW","FDV"],0,"C(3)+3=F, A(1)+3=D, T(20)+3=W."],
["r10","In a code, MONEY is written as NPOFZ (each letter shifted +1). How is TIME written?",["UJNF","UJNG","UINF","UJMF"],0,"Shift each letter of TIME forward by one place."],
["r11","In a code, DELHI is written as EFMIJ (each letter shifted +1). How is MUMBAI written?",["NVNCBJ","NVMCBJ","NVNCBI","MVNCBJ"],0,"Shift each letter of MUMBAI forward by one place."],
["r12","Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",["Mother","Sister","Aunt","Grandmother"],0,"The only daughter of the woman's mother is the woman herself, so she is the man's mother."],
["r13","A is the son of B. C, B's sister, has a daughter D. How is A related to D?",["Cousins","Siblings","Uncle and niece","Nephew and aunt"],0,"B and C are siblings, so their children A and D are cousins."],
["r14","Introducing a boy, a girl said, 'He is the son of my father's only daughter.' How is the boy related to the girl?",["Son","Brother","Nephew","Cousin"],0,"The girl is her father's only daughter, so she is speaking about her own son."],
["r15","P is the father of Q. Q is the sister of R. R is the son of S. How is S related to P?",["Wife","Sister","Daughter","Mother"],0,"Q and R are children of both P and S, so S is P's wife."],
["r16","X and Y are sisters. M is the father of X. How is M related to Y?",["Father","Uncle","Brother","Grandfather"],0,"Since X and Y are sisters, X's father is also Y's father."],
["r17","A person walks 6 km East and then 8 km South. How far is he from the starting point?",["10 km","12 km","14 km","8 km"],0,"Using Pythagoras theorem: √(6²+8²) = 10 km."],
["r18","Ram walks 4 km North, turns left and walks 4 km, then turns left again and walks 4 km. In which direction is he from the starting point?",["West","East","North","South"],0,"Plotting the path shows he ends up 4 km due West of the start."],
["r19","Suresh walks 3 km North, then turns right and walks 4 km. How far is he from the starting point?",["5 km","7 km","6 km","4 km"],0,"Using Pythagoras theorem: √(3²+4²) = 5 km."],
["r20","A man facing North turns 90° clockwise, then 180°, then 90° anticlockwise. Which direction does he face now?",["South","North","East","West"],0,"North → East (90° cw) → West (180°) → South (90° ccw)."],
["r21","Rita walks 5 km South, then 5 km East, then 5 km North. How far and in which direction is she from her starting point?",["5 km East","5 km West","10 km East","She is back at the start"],0,"The North and South distances cancel out, leaving 5 km East."],
["r22","Statements: All roses are flowers. All flowers are plants. Conclusions: I. All roses are plants. II. Some plants are roses.",["Only I follows","Only II follows","Both I and II follow","Neither follows"],2,"Both conclusions logically follow from the given statements."],
["r23","Statements: Some books are pens. All pens are pencils. Conclusion: Some books are pencils.",["Conclusion follows","Conclusion does not follow","Cannot be determined","None of these"],0,"Some books are pens, and all pens are pencils, so some books must be pencils."],
["r24","Statements: No door is a window. All windows are walls. Conclusions: I. No door is a wall. II. Some walls are windows.",["Only I follows","Only II follows","Both follow","Neither follows"],1,"Only conclusion II follows, by conversion of the second statement."],
["r25","Statements: All cups are plates. Some plates are spoons. Conclusion: Some cups are spoons.",["Conclusion follows","Conclusion does not follow","Cannot be determined","None of these"],1,"The statements don't guarantee a direct link between cups and spoons."],
["r26","Statements: All mangoes are fruits. No fruit is a vegetable. Conclusions: I. No mango is a vegetable. II. Some fruits are mangoes.",["Only I follows","Only II follows","Both I and II follow","Neither follows"],2,"Both conclusions are valid consequences of the statements."],
["r27","Statements: Some pens are books. Some books are copies. Conclusion: Some pens are copies.",["Conclusion follows","Conclusion does not follow","Cannot be determined","None of these"],1,"Two particular statements cannot yield a valid conclusion."],
["r28","If A>B, B≥C, C>D, which is definitely true?",["A>D","D>A","A=D","Cannot be determined"],0,"Combining the inequalities gives A>D."],
["r29","Statements: A≥B>C=D. Conclusions: I. A>C  II. B>D",["Only I follows","Only II follows","Both I and II follow","Neither follows"],2,"Both A>C and B>D follow from the chain of inequalities."],
["r30","If X>Y≥Z and Z>W, what is the relationship between X and W?",["X>W","X<W","X=W","Cannot be determined"],0,"Chaining the inequalities gives X>W."],
["r31","Statements: M<N, N≤O, O<P. Conclusion: M<P.",["Conclusion follows","Conclusion does not follow","Cannot be determined","None of these"],0,"Chaining M<N≤O<P gives M<P."],
["r32","Statements: A=B, B<C, C≤D. Conclusions: I. A<D  II. A<C",["Only I follows","Only II follows","Both I and II follow","Neither follows"],2,"Both conclusions follow from substituting A=B into the chain."],
["r33","In a class of 40 students, Rahul ranks 14th from the top. What is his rank from the bottom?",["27","26","28","25"],0,"Rank from bottom = total − rank from top + 1 = 40−14+1 = 27."],
["r34","If the letters of GARDEN are arranged alphabetically, which letter is third from the left?",["E","D","G","N"],0,"Alphabetical order: A, D, E, G, N, R — third letter is E."],
["r35","In a row of 30 students, Anil is 12th from the left end. What is his position from the right end?",["19","18","20","17"],0,"Position from right = 30−12+1 = 19."],
["r36","Which letter is exactly midway between J and R in the English alphabet?",["N","M","O","L"],0,"J is 10th and R is 18th; the midpoint is the 14th letter, N."],
["r37","Find the odd one out.",["Wood","Triangle","Square","Circle"],0,"Triangle, square and circle are geometric shapes; wood is a material."],
["r38","Find the odd one out.",["100","27","64","125"],0,"27, 64 and 125 are perfect cubes (3³,4³,5³); 100 is not."],
["r39","If Monday is coded as 2 and Wednesday as 4, how is Saturday coded?",["7","6","8","5"],0,"Counting Monday=2 sequentially, Saturday is the 6th day, coded as 7."],
["r40","Choose the word that is least like the others.",["Carrot","Apple","Banana","Mango"],0,"Apple, banana and mango are fruits; carrot is a vegetable."],
];

const RAW_QUANT = [
["q1","Find the value: 15% of 240 + 20% of 150",["66","68","64","70"],0,"15% of 240=36, 20% of 150=30, sum=66."],
["q2","Simplify: (12×8) − (6×5) + 15",["81","79","83","85"],0,"96−30+15=81."],
["q3","Find the value: √196 + √225",["29","28","30","27"],0,"√196=14, √225=15, sum=29."],
["q4","Find the value: 3/4 of 480 − 1/3 of 240",["280","270","290","260"],0,"360−80=280."],
["q5","25% of 640 is what percent of 320?",["50%","40%","60%","45%"],0,"25% of 640=160; 160 is 50% of 320."],
["q6","Simplify: (45×4)÷9 + 15",["35","33","37","40"],0,"180÷9=20, 20+15=35."],
["q7","A student scored 462 marks out of 700 in an exam. What percentage did he score?",["66%","64%","68%","70%"],0,"462/700×100=66%."],
["q8","The price of an item is increased by 20% and then decreased by 20%. What is the net percentage change?",["4% decrease","4% increase","No change","20% decrease"],0,"100×1.2×0.8=96, a net decrease of 4%."],
["q9","40% of a number is 180. Find the number.",["450","460","440","480"],0,"Number=180/0.40=450."],
["q10","In an election, a candidate got 55% of votes and won by 6000 votes. Find the total votes.",["60,000","55,000","65,000","50,000"],0,"Winning margin=10% of total=6000, so total=60,000."],
["q11","A number when increased by 25% gives 500. Find the number.",["400","420","380","450"],0,"Number=500/1.25=400."],
["q12","A shopkeeper buys an article for ₹800 and sells it for ₹960. Find the profit percentage.",["20%","15%","25%","18%"],0,"Profit=160; percentage=160/800×100=20%."],
["q13","An article is sold at a loss of 10% for ₹450. Find its cost price.",["₹500","₹480","₹520","₹510"],0,"CP=450/0.9=₹500."],
["q14","Find the selling price of an article costing ₹1200 to earn a profit of 15%.",["₹1,380","₹1,360","₹1,400","₹1,350"],0,"SP=1200×1.15=₹1,380."],
["q15","A trader marks goods 40% above cost price and gives a 10% discount. Find his profit percentage.",["26%","30%","24%","28%"],0,"CP=100, MP=140, SP=140×0.9=126, profit=26%."],
["q16","By selling an item for ₹684, a man loses 5%. What selling price would give him a 5% gain?",["₹756","₹750","₹760","₹744"],0,"CP=684/0.95=₹720; SP for 5% gain=720×1.05=₹756."],
["q17","The average of 5 numbers is 42. Excluding one number, the average of the remaining 4 becomes 40. Find the excluded number.",["50","48","52","45"],0,"Sum of 5=210, sum of 4=160, excluded number=50."],
["q18","The average age of 30 students is 15 years. Including the teacher's age, the average becomes 16. Find the teacher's age.",["46","45","48","44"],0,"Sum of 30=450, sum of 31=496, teacher's age=46."],
["q19","Find the average of the first 20 natural numbers.",["10.5","10","11","9.5"],0,"Sum=20×21/2=210, average=210/20=10.5."],
["q20","The average marks of 30 students is 50. The average of the first 18 students is 45. Find the average of the remaining 12.",["57.5","55","60","52.5"],0,"Sum of 30=1500, sum of 18=810, remaining sum=690, average=57.5."],
["q21","Find the simple interest on ₹5000 at 8% per annum for 3 years.",["₹1,200","₹1,000","₹1,500","₹1,100"],0,"SI=5000×8×3/100=₹1,200."],
["q22","Find the compound interest on ₹4000 at 10% per annum for 2 years.",["₹840","₹800","₹880","₹820"],0,"CI=4000×(1.1²−1)=₹840."],
["q23","A sum of money doubles itself in 8 years on simple interest. Find the annual rate of interest.",["12.5%","10%","15%","8%"],0,"Rate=100/time=100/8=12.5%."],
["q24","Find the principal that amounts to ₹6600 in 2 years at 10% simple interest per annum.",["₹5,500","₹5,400","₹5,600","₹5,000"],0,"Amount=P×1.2=6600, so P=₹5,500."],
["q25","A can complete a work in 12 days and B in 18 days. In how many days will they finish it together?",["7.2 days","8 days","7 days","7.5 days"],0,"1/12+1/18=5/36, time=36/5=7.2 days."],
["q26","A alone can finish a work in 20 days. He works for 5 days and leaves; B finishes the rest in 15 days. In how many days can B alone finish the whole work?",["20 days","18 days","22 days","15 days"],0,"B completes 3/4 work in 15 days, so full work takes 20 days."],
["q27","6 men complete a work in 15 days. How many days will 9 men take for the same work?",["10 days","12 days","9 days","8 days"],0,"Men × days is constant: 6×15=90, 90/9=10 days."],
["q28","A and B together finish a work in 10 days. A alone can do it in 15 days. In how many days can B alone finish it?",["30 days","25 days","20 days","35 days"],0,"1/10−1/15=1/30, so B takes 30 days."],
["q29","Divide ₹1200 between A and B in the ratio 3:5. Find A's share.",["₹450","₹500","₹400","₹480"],0,"A's share=3/8×1200=₹450."],
["q30","Two numbers are in the ratio 4:7 and their sum is 231. Find the smaller number.",["84","88","80","90"],0,"Each part=231/11=21, smaller number=4×21=84."],
["q31","If a:b=2:3 and b:c=4:5, find a:b:c.",["8:12:15","2:3:5","8:15:12","4:6:5"],0,"Making b common (12): a:b=8:12, b:c=12:15, so a:b:c=8:12:15."],
["q32","Two numbers are in the ratio 5:6. If 5 is subtracted from each, the ratio becomes 4:5. Find the numbers.",["25 and 30","20 and 24","30 and 36","15 and 18"],0,"Solving (5x−5)/(6x−5)=4/5 gives x=5, so the numbers are 25 and 30."],
["q33","Find the missing number: 2, 3, 5, 8, 13, 21, ?",["34","33","35","36"],0,"Each term is the sum of the previous two terms (Fibonacci series)."],
["q34","Find the missing number: 1, 8, 27, 64, ?, 216",["125","100","120","130"],0,"The series is cubes of 1,2,3,4,5,6; the missing term is 5³=125."],
["q35","Find the missing number: 11, 13, 17, 19, 23, ?",["29","27","31","25"],0,"The series consists of consecutive prime numbers."],
["q36","Find the missing number: 5, 10, 20, 40, 80, ?",["160","150","170","140"],0,"Each term is double the previous term."],
["q37","A father's present age is 3 times his son's age. After 10 years, the father's age will be twice the son's age. Find the son's present age.",["10 years","12 years","15 years","8 years"],0,"Solving 3x+10=2(x+10) gives x=10."],
["q38","Five years ago, A was thrice as old as B. Ten years hence, A will be twice as old as B. Find A's present age.",["50 years","45 years","55 years","40 years"],0,"Solving the two equations gives A=50 and B=20."],
["q39","The price of sugar rises from ₹40/kg to ₹50/kg. By what percentage should consumption be reduced to keep expenditure unchanged?",["20%","25%","15%","10%"],0,"Reduction %=increase/(100+increase)×100=10/50×100=20%."],
["q40","A train 150 m long crosses a pole in 15 seconds. Find its speed in km/hr.",["36 km/hr","40 km/hr","30 km/hr","45 km/hr"],0,"Speed=150/15=10 m/s=36 km/hr."],
];

const RAW_ENGLISH = [
["e1","Identify the part with an error: 'He don't know (A) / how to solve (B) / this problem (C) / at all (D)'",["Part A","Part B","Part C","No error"],0,"'He don't' should be 'He doesn't' since 'he' is third-person singular."],
["e2","'Each of the students (A) / have submitted (B) / their assignment (C) / on time (D)'",["Part A","Part B","Part C","No error"],1,"'Each' is singular, so it should be 'has submitted'."],
["e3","'Neither of the two boys (A) / were present (B) / in the class (C) / yesterday (D)'",["Part A","Part B","Part C","No error"],1,"'Neither' takes a singular verb, so it should be 'was present'."],
["e4","'She is one of the students (A) / who is going (B) / to participate (C) / in the competition (D)'",["Part A","Part B","Part C","No error"],1,"The relative pronoun refers to 'students', so it should be 'who are going'."],
["e5","'The number of accidents (A) / have increased (B) / over the past (C) / few years (D)'",["Part A","Part B","Part C","No error"],1,"'The number of' takes a singular verb, so it should be 'has increased'."],
["e6","'He is senior than me (A) / by almost (B) / five years (C) / in the office (D)'",["Part A","Part B","Part C","No error"],0,"'Senior' is followed by 'to', not 'than': 'senior to me'."],
["e7","'I am used to (A) / getting up early (B) / since I (C) / was a child (D)'",["Part A","Part B","Part C","No error"],3,"The sentence is grammatically correct as it stands."],
["e8","'Each and every student (A) / was given (B) / a fair chance (C) / to prove themselves (D)'",["Part A","Part B","Part C","Part D"],3,"'Each and every' is singular, so it should be 'himself/herself', not 'themselves'."],
["e9","She has been working here _____ 2015.",["since","for","from","in"],0,"'Since' is used with a specific point in time."],
["e10","He is not only intelligent _____ also hardworking.",["but","and","or","so"],0,"The correlative conjunction pair is 'not only...but also'."],
["e11","Despite _____ hard, he failed the exam.",["working","work","worked","to work"],0,"'Despite' is followed by a gerund (-ing form)."],
["e12","The manager asked the employees _____ the report by Friday.",["to complete","completing","complete","completed"],0,"'Ask someone to do something' takes the infinitive form."],
["e13","If I _____ known earlier, I would have helped you.",["had","have","has","having"],0,"This is a third conditional sentence requiring the past perfect 'had known'."],
["e14","The committee _____ yet to decide on the matter.",["is","are","were","have"],0,"'Committee' is treated as a singular collective noun here."],
["e15","No sooner did he reach the station _____ the train left.",["than","when","then","that"],0,"'No sooner...than' is the correct correlative pair."],
["e16","She is good _____ mathematics.",["at","in","with","on"],0,"The correct preposition after 'good' for a subject is 'at'."],
["e17","Choose the word most similar in meaning to 'AUGMENT' as used in: 'The company decided to augment its workforce.'",["Increase","Reduce","Replace","Train"],0,"'Augment' means to make something greater in size or amount."],
["e18","Choose the word opposite in meaning to 'FRUGAL' as used in: 'He is known for his frugal lifestyle.'",["Extravagant","Simple","Modest","Careful"],0,"'Frugal' means economical; its opposite is 'extravagant'."],
["e19","Choose the word most similar to 'CANDID' as used in: 'She gave a candid opinion about the project.'",["Frank","Vague","Harsh","Polite"],0,"'Candid' means open and honest, similar to 'frank'."],
["e20","Choose the word opposite in meaning to 'TRANSPARENT' as used in: 'The new policy is transparent.'",["Obscure","Clear","Honest","Open"],0,"'Transparent' means easy to see through or understand; its opposite is 'obscure'."],
["e21","Choose the word most similar to 'MERGE' as used in: 'The two companies decided to merge.'",["Combine","Separate","Compete","Expand"],0,"'Merge' means to combine or unite."],
["e22","Choose the word opposite in meaning to 'ABUNDANT' as used in: 'Water is abundant in this region.'",["Scarce","Plentiful","Sufficient","Ample"],0,"'Abundant' means plentiful; its opposite is 'scarce'."],
["e23","Improve the sentence: 'He is one of the best player in the team.'",["one of the best players","one of best player","one of the best playing","No improvement needed"],0,"'One of the' is followed by a plural noun: 'players'."],
["e24","Improve the sentence: 'Neither the manager nor the employees was present at the meeting.'",["were present","is present","has been present","No improvement needed"],0,"With 'neither...nor', the verb agrees with the nearer subject, 'employees' (plural)."],
["e25","Improve the sentence: 'She has been living in Delhi since five years.'",["for five years","since five year","from five years","No improvement needed"],0,"'For' is used with a duration of time, not 'since'."],
["e26","Improve the sentence: 'He always avoids to eat junk food.'",["avoids eating","avoid eating","avoids to eating","No improvement needed"],0,"'Avoid' is followed by a gerund, not an infinitive."],
["e27","Improve the sentence: 'The teacher along with the students were going on a trip.'",["was going","are going","is going","No improvement needed"],0,"The subject 'teacher' is singular; phrases like 'along with' don't change the verb's number."],
["e28","Improve the sentence: 'It is raining since morning.'",["has been raining","was raining","raining","No improvement needed"],0,"An action continuing from the past to now with 'since' needs the present perfect continuous."],
["e29","Choose the correct one-word substitute: 'A person who studies and is skilled in the science of language.'",["Linguist","Philologist","Polyglot","Grammarian"],0,"A 'linguist' studies language and linguistics."],
["e30","Choose the correct one-word substitute: 'A place where birds are kept.'",["Aviary","Apiary","Aquarium","Sanctuary"],0,"An 'aviary' is a large enclosure for keeping birds."],
["e31","Choose the correct one-word substitute: 'One who cannot read or write.'",["Illiterate","Illegible","Innumerate","Uneducated"],0,"'Illiterate' specifically means unable to read or write."],
["e32","Choose the correct one-word substitute: 'A person who loves books.'",["Bibliophile","Bibliographer","Philanthropist","Antiquarian"],0,"A 'bibliophile' is a lover of books."],
["e33","Choose the correctly spelt word.",["Necessary","Neccessary","Necesary","Neccesary"],0,"'Necessary' has one 'c' and two 's's."],
["e34","Choose the correctly spelt word.",["Occurrence","Occurence","Ocurrence","Occurrance"],0,"'Occurrence' has a double 'r' and ends in '-ence'."],
["e35","Choose the correctly spelt word.",["Embarrass","Embarass","Embaras","Embarras"],0,"'Embarrass' has a double 'r' and a double 's'."],
];

function buildBank(raw, section) {
  return raw.map(([id, q, o, a, exp]) => ({ id, section, q, o, a, exp }));
}

const QUESTION_BANK = {
  reasoning: buildBank(RAW_REASONING, "reasoning"),
  quant: buildBank(RAW_QUANT, "quant"),
  english: buildBank(RAW_ENGLISH, "english"),
};

const SECTION_CONFIG = [
  { key: "english", label: "English Language", count: 30, minutes: 20 },
  { key: "quant", label: "Quantitative Aptitude", count: 35, minutes: 20 },
  { key: "reasoning", label: "Reasoning Ability", count: 35, minutes: 20 },
];

const TOTAL_QUESTIONS = SECTION_CONFIG.reduce((s, c) => s + c.count, 0);
const TOTAL_MINUTES = SECTION_CONFIG.reduce((s, c) => s + c.minutes, 0);

/* ---------------------------------------------------------
   UTILITIES
--------------------------------------------------------- */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(question) {
  const withIdx = question.o.map((opt, i) => ({ opt, i }));
  const shuffled = shuffle(withIdx);
  const newCorrect = shuffled.findIndex((x) => x.i === question.a);
  return { ...question, o: shuffled.map((x) => x.opt), a: newCorrect };
}

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

async function loadJSON(key, fallback) {
  try {
    const r = await window.storage.get(key, false);
    return r ? JSON.parse(r.value) : fallback;
  } catch (e) {
    return fallback;
  }
}
async function saveJSON(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    /* ignore */
  }
}

const USED_KEY = "ibpspo:used-ids";
const HISTORY_KEY = "ibpspo:history";

function pickSectionQuestions(sectionKey, count, usedIds) {
  const bank = QUESTION_BANK[sectionKey];
  const used = usedIds[sectionKey] || [];
  const unused = bank.filter((q) => !used.includes(q.id));
  let pool, cycled;
  if (unused.length >= count) {
    pool = shuffle(unused).slice(0, count);
    cycled = false;
  } else {
    const remainder = count - unused.length;
    const usedPool = shuffle(bank.filter((q) => used.includes(q.id))).slice(0, remainder);
    pool = shuffle([...unused, ...usedPool]);
    cycled = remainder > 0;
  }
  return { pool: pool.map(shuffleOptions), cycled };
}

function generateMock(usedIds) {
  let anyCycled = false;
  const newUsed = { reasoning: [...(usedIds.reasoning || [])], quant: [...(usedIds.quant || [])], english: [...(usedIds.english || [])] };
  const sections = SECTION_CONFIG.map((cfg) => {
    const { pool, cycled } = pickSectionQuestions(cfg.key, cfg.count, usedIds);
    if (cycled) anyCycled = true;
    pool.forEach((q) => {
      if (!newUsed[cfg.key].includes(q.id)) newUsed[cfg.key].push(q.id);
    });
    return { ...cfg, questions: pool };
  });
  return { sections, newUsed, cycled: anyCycled };
}

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */

export default function Mock() {
  const [screen, setScreen] = useState("landing"); // landing | instructions | test | result
  const [loaded, setLoaded] = useState(false);
  const [usedIds, setUsedIds] = useState({ reasoning: [], quant: [], english: [] });
  const [history, setHistory] = useState([]);
  const [mock, setMock] = useState(null);
  const [cycledNotice, setCycledNotice] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({}); // qid -> not-visited|not-answered|answered|marked|answered-marked
  const [timeLeft, setTimeLeft] = useState(0);
  const [confirm, setConfirm] = useState(null); // {title, body, onConfirm}
  const [result, setResult] = useState(null);
  const [reviewSection, setReviewSection] = useState(0);
  const [expandedQ, setExpandedQ] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      const u = await loadJSON(USED_KEY, { reasoning: [], quant: [], english: [] });
      const h = await loadJSON(HISTORY_KEY, []);
      setUsedIds(u);
      setHistory(h);
      setLoaded(true);
    })();
  }, []);

  /* ---------- Timer ---------- */
  useEffect(() => {
    if (screen !== "test" || !mock) return;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          advanceSection(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, sectionIdx, mock]);

  /* ---------- Actions ---------- */

  function startNewMock() {
    const { sections, newUsed, cycled } = generateMock(usedIds);
    setUsedIds(newUsed);
    saveJSON(USED_KEY, newUsed);
    setMock({ sections });
    setCycledNotice(cycled);
    setAgreed(false);
    setAnswers({});
    setStatus({});
    setSectionIdx(0);
    setQIdx(0);
    setScreen("instructions");
  }

  function beginTest() {
    setTimeLeft(mock.sections[0].minutes * 60);
    setQIdx(0);
    setScreen("test");
  }

  function currentQuestion() {
    if (!mock) return null;
    return mock.sections[sectionIdx].questions[qIdx];
  }

  function markVisited(qid) {
    setStatus((s) => (s[qid] ? s : { ...s, [qid]: "not-answered" }));
  }

  useEffect(() => {
    const q = currentQuestion();
    if (q) markVisited(q.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIdx, qIdx, mock]);

  function selectOption(qid, optIdx) {
    setAnswers((a) => ({ ...a, [qid]: optIdx }));
  }

  function goto(idx) {
    const secQs = mock.sections[sectionIdx].questions;
    setQIdx(Math.max(0, Math.min(secQs.length - 1, idx)));
  }

  function saveAndNext() {
    const q = currentQuestion();
    setStatus((s) => {
      const has = answers[q.id] !== undefined;
      const wasMarked = s[q.id] === "marked" || s[q.id] === "answered-marked";
      return { ...s, [q.id]: has ? (wasMarked ? "answered-marked" : "answered") : (wasMarked ? "marked" : "not-answered") };
    });
    if (qIdx < mock.sections[sectionIdx].questions.length - 1) goto(qIdx + 1);
  }

  function markAndNext() {
    const q = currentQuestion();
    setStatus((s) => {
      const has = answers[q.id] !== undefined;
      return { ...s, [q.id]: has ? "answered-marked" : "marked" };
    });
    if (qIdx < mock.sections[sectionIdx].questions.length - 1) goto(qIdx + 1);
  }

  function clearResponse() {
    const q = currentQuestion();
    setAnswers((a) => {
      const n = { ...a };
      delete n[q.id];
      return n;
    });
    setStatus((s) => ({ ...s, [q.id]: s[q.id] === "answered-marked" ? "marked" : "not-answered" }));
  }

  function advanceSection(auto) {
    if (sectionIdx < mock.sections.length - 1) {
      const next = sectionIdx + 1;
      setSectionIdx(next);
      setQIdx(0);
      setTimeLeft(mock.sections[next].minutes * 60);
      setConfirm(null);
    } else {
      finishTest();
    }
  }

  function requestNextSection() {
    setConfirm({
      title: "Move to next section?",
      body: "You won't be able to come back to this section once you leave it. This matches the real exam's sectional time lock.",
      confirmLabel: "Yes, continue",
      onConfirm: () => advanceSection(false),
    });
  }

  function requestSubmit() {
    const unanswered = mock.sections.reduce((sum, sec) => {
      return sum + sec.questions.filter((q) => answers[q.id] === undefined).length;
    }, 0);
    setConfirm({
      title: "Submit test?",
      body: `You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"} across the full test. Once submitted, you can't change your answers.`,
      confirmLabel: "Submit test",
      onConfirm: () => finishTest(),
    });
  }

  function finishTest() {
    clearInterval(timerRef.current);
    const sectionResults = mock.sections.map((sec) => {
      let correct = 0, wrong = 0, unattempted = 0;
      sec.questions.forEach((q) => {
        const ans = answers[q.id];
        if (ans === undefined) unattempted++;
        else if (ans === q.a) correct++;
        else wrong++;
      });
      const marks = correct * 1 - wrong * 0.25;
      return { key: sec.key, label: sec.label, total: sec.questions.length, correct, wrong, unattempted, marks };
    });
    const totalMarks = sectionResults.reduce((s, r) => s + r.marks, 0);
    const res = {
      id: Date.now(),
      date: new Date().toISOString(),
      sectionResults,
      totalMarks: Math.round(totalMarks * 100) / 100,
      totalMax: TOTAL_QUESTIONS,
    };
    setResult(res);
    const newHistory = [...history, res].slice(-20);
    setHistory(newHistory);
    saveJSON(HISTORY_KEY, newHistory);
    setReviewSection(0);
    setConfirm(null);
    setScreen("result");
  }

  async function resetProgress() {
    setConfirm({
      title: "Reset all practice data?",
      body: "This clears your used-question history and past scores, so future mocks may repeat questions you've already seen. This can't be undone.",
      confirmLabel: "Reset everything",
      onConfirm: async () => {
        const empty = { reasoning: [], quant: [], english: [] };
        setUsedIds(empty);
        setHistory([]);
        await saveJSON(USED_KEY, empty);
        await saveJSON(HISTORY_KEY, []);
        setConfirm(null);
      },
    });
  }

  /* ---------- Derived ---------- */

  const bankTotals = { reasoning: QUESTION_BANK.reasoning.length, quant: QUESTION_BANK.quant.length, english: QUESTION_BANK.english.length };
  const usedTotals = { reasoning: usedIds.reasoning?.length || 0, quant: usedIds.quant?.length || 0, english: usedIds.english?.length || 0 };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        .app {
          --bg: #F4F5F7; --surface: #FFFFFF; --ink: #121A2B; --ink-soft: #4B5567;
          --line: #DEE2E8; --brand: #1E40AF; --brand-dim: #E7ECFB;
          --danger: #C0362C; --danger-dim: #FBEAE8; --success: #157A4A; --success-dim: #E7F4EC;
          --warn: #B4790A; --warn-dim: #FBF0DD; --grey: #9AA0AC; --grey-dim: #EEF0F3;
          font-family: 'IBM Plex Sans', system-ui, sans-serif;
          background: var(--bg); color: var(--ink);
          min-height: 100vh; width: 100%;
        }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        button { font-family: inherit; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) { .app * { transition: none !important; animation: none !important; } }
        :focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

        /* ---- Landing ---- */
        .landing { max-width: 760px; margin: 0 auto; padding: 48px 20px 80px; }
        .brandline { font-size: 13px; letter-spacing: 0.02em; color: var(--brand); font-weight: 600; margin-bottom: 10px; }
        .h1 { font-size: 34px; font-weight: 700; line-height: 1.15; margin: 0 0 10px; }
        .lede { color: var(--ink-soft); font-size: 15.5px; line-height: 1.6; max-width: 60ch; margin-bottom: 28px; }
        .pattern-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
        .pattern-head { padding: 14px 18px; border-bottom: 1px solid var(--line); font-weight: 600; font-size: 14px; background: var(--brand-dim); color: var(--brand); }
        table.pattern { width: 100%; border-collapse: collapse; font-size: 14.5px; }
        table.pattern th, table.pattern td { text-align: left; padding: 11px 18px; border-bottom: 1px solid var(--line); }
        table.pattern th { color: var(--ink-soft); font-weight: 500; font-size: 12.5px; }
        table.pattern tr:last-child td { border-bottom: none; font-weight: 600; }
        table.pattern td.num { font-family: 'IBM Plex Mono', monospace; }
        .cta-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 36px; }
        .btn { padding: 12px 22px; border-radius: 8px; font-size: 15px; font-weight: 600; border: 1px solid transparent; }
        .btn-primary { background: var(--brand); color: #fff; }
        .btn-primary:hover { background: #17337f; }
        .btn-ghost { background: var(--surface); border-color: var(--line); color: var(--ink); }
        .btn-ghost:hover { border-color: var(--brand); }
        .btn-sm { padding: 8px 14px; font-size: 13.5px; border-radius: 7px; }
        .stats-row { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 20px; }
        .stat { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px 18px; min-width: 120px; }
        .stat .num { font-family: 'IBM Plex Mono', monospace; font-size: 24px; font-weight: 700; }
        .stat .lbl { font-size: 12.5px; color: var(--ink-soft); margin-top: 2px; }
        .history-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: 14px; }
        .history-row:last-child { border-bottom: none; }
        .bar-wrap { display: flex; align-items: flex-end; gap: 6px; height: 60px; margin: 6px 0 18px; }
        .bar { width: 16px; background: var(--brand); border-radius: 3px 3px 0 0; min-height: 3px; }
        .section-title { font-size: 13px; font-weight: 600; color: var(--ink-soft); text-transform: none; margin: 30px 0 10px; }
        .reset-link { background: none; border: none; color: var(--ink-soft); font-size: 13px; text-decoration: underline; padding: 0; margin-top: 30px; }
        .cycle-note { background: var(--warn-dim); color: var(--warn); border: 1px solid #F0DBAE; padding: 10px 14px; border-radius: 8px; font-size: 13.5px; margin-bottom: 20px; }

        /* ---- Instructions ---- */
        .instructions { max-width: 680px; margin: 0 auto; padding: 44px 20px 60px; }
        .instructions h1 { font-size: 24px; margin: 0 0 6px; }
        .instructions .sub { color: var(--ink-soft); font-size: 14px; margin-bottom: 26px; }
        .instr-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 22px 24px; margin-bottom: 18px; }
        .instr-card h3 { font-size: 14.5px; margin: 0 0 12px; }
        .instr-card ul { margin: 0; padding-left: 20px; font-size: 14.5px; line-height: 1.75; color: var(--ink-soft); }
        .agree-row { display: flex; align-items: flex-start; gap: 10px; margin: 22px 0; font-size: 14.5px; }
        .agree-row input { margin-top: 3px; width: 16px; height: 16px; }

        /* ---- Test screen ---- */
        .test-wrap { display: flex; flex-direction: column; min-height: 100vh; }
        .topbar { display: flex; align-items: center; justify-content: space-between; background: var(--ink); color: #fff; padding: 12px 20px; flex-wrap: wrap; gap: 10px; }
        .topbar .title { font-weight: 600; font-size: 14.5px; }
        .topbar .timer { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 700; padding: 6px 14px; border-radius: 7px; background: rgba(255,255,255,0.12); }
        .topbar .timer.low { background: var(--danger); }
        .tabbar { display: flex; gap: 6px; padding: 10px 20px; background: var(--surface); border-bottom: 1px solid var(--line); overflow-x: auto; }
        .tab { padding: 7px 14px; border-radius: 7px; font-size: 13px; font-weight: 600; color: var(--ink-soft); background: var(--grey-dim); white-space: nowrap; }
        .tab.active { background: var(--brand); color: #fff; }
        .test-body { flex: 1; display: flex; gap: 0; }
        .q-panel { flex: 1; padding: 26px 30px; min-width: 0; }
        .q-num { font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: var(--ink-soft); margin-bottom: 10px; }
        .q-text { font-size: 16.5px; line-height: 1.55; margin-bottom: 22px; }
        .option { display: flex; align-items: flex-start; gap: 12px; padding: 13px 16px; border: 1px solid var(--line); border-radius: 9px; margin-bottom: 10px; background: var(--surface); font-size: 15px; }
        .option:hover { border-color: var(--brand); }
        .option.selected { border-color: var(--brand); background: var(--brand-dim); }
        .option input { margin-top: 2px; }
        .action-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 24px; }
        .palette { width: 260px; flex-shrink: 0; background: var(--surface); border-left: 1px solid var(--line); padding: 20px; overflow-y: auto; }
        .legend { display: flex; flex-direction: column; gap: 6px; font-size: 11.5px; color: var(--ink-soft); margin-bottom: 16px; }
        .legend-item { display: flex; align-items: center; gap: 6px; }
        .dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
        .p-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 7px; }
        .p-btn { font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; font-weight: 600; height: 32px; border-radius: 6px; border: none; color: #fff; }
        .p-btn.current { outline: 2px solid var(--ink); outline-offset: 2px; }
        .p-not-visited { background: var(--grey); }
        .p-not-answered { background: var(--danger); }
        .p-answered { background: var(--success); }
        .p-marked { background: var(--warn); }
        .p-answered-marked { background: var(--warn); box-shadow: inset 0 0 0 3px var(--success); }
        .bottombar { display: flex; justify-content: space-between; padding: 14px 20px; border-top: 1px solid var(--line); background: var(--surface); flex-wrap: wrap; gap: 10px; }

        @media (max-width: 760px) {
          .test-body { flex-direction: column; }
          .palette { width: 100%; border-left: none; border-top: 1px solid var(--line); }
          .q-panel { padding: 20px 16px; }
        }

        /* ---- Modal ---- */
        .modal-overlay { position: fixed; inset: 0; background: rgba(18,26,43,0.55); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }
        .modal { background: var(--surface); border-radius: 12px; padding: 26px; max-width: 420px; width: 100%; }
        .modal h3 { margin: 0 0 10px; font-size: 17px; }
        .modal p { margin: 0 0 20px; font-size: 14.5px; color: var(--ink-soft); line-height: 1.55; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }

        /* ---- Result ---- */
        .result { max-width: 820px; margin: 0 auto; padding: 44px 20px 70px; }
        .score-hero { background: var(--ink); color: #fff; border-radius: 12px; padding: 32px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 24px; }
        .score-hero .num { font-family: 'IBM Plex Mono', monospace; font-size: 44px; font-weight: 700; }
        .score-hero .lbl { font-size: 13.5px; opacity: 0.75; margin-top: 2px; }
        table.section-table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; margin-bottom: 30px; font-size: 14px; }
        table.section-table th, table.section-table td { text-align: left; padding: 12px 16px; border-bottom: 1px solid var(--line); }
        table.section-table th { background: var(--grey-dim); font-size: 12px; color: var(--ink-soft); font-weight: 600; }
        table.section-table tr:last-child td { border-bottom: none; }
        .review-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .review-row { background: var(--surface); border: 1px solid var(--line); border-radius: 9px; padding: 12px 16px; margin-bottom: 8px; cursor: pointer; }
        .review-row .rr-top { display: flex; align-items: center; gap: 10px; font-size: 14px; }
        .rr-badge { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 5px; color: #fff; }
        .rr-correct { background: var(--success); } .rr-wrong { background: var(--danger); } .rr-skip { background: var(--grey); }
        .rr-detail { margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--ink-soft); line-height: 1.6; }
        .result-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; margin-bottom: 10px; }
      `}</style>

      {!loaded && <div style={{ padding: 60, textAlign: "center", color: "var(--ink-soft)" }}>Loading…</div>}

      {loaded && screen === "landing" && (
        <LandingScreen
          history={history}
          bankTotals={bankTotals}
          usedTotals={usedTotals}
          onStart={startNewMock}
          onReset={resetProgress}
        />
      )}

      {loaded && screen === "instructions" && mock && (
        <InstructionsScreen
          mock={mock}
          cycledNotice={cycledNotice}
          agreed={agreed}
          setAgreed={setAgreed}
          onBegin={beginTest}
          onBack={() => setScreen("landing")}
        />
      )}

      {loaded && screen === "test" && mock && (
        <TestScreen
          mock={mock}
          sectionIdx={sectionIdx}
          qIdx={qIdx}
          answers={answers}
          status={status}
          timeLeft={timeLeft}
          selectOption={selectOption}
          goto={goto}
          saveAndNext={saveAndNext}
          markAndNext={markAndNext}
          clearResponse={clearResponse}
          onNextSection={requestNextSection}
          onSubmit={requestSubmit}
        />
      )}

      {loaded && screen === "result" && result && mock && (
        <ResultScreen
          result={result}
          mock={mock}
          answers={answers}
          reviewSection={reviewSection}
          setReviewSection={setReviewSection}
          expandedQ={expandedQ}
          setExpandedQ={setExpandedQ}
          onRetake={() => {
            setScreen("landing");
          }}
        />
      )}

      {confirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{confirm.title}</h3>
            <p>{confirm.body}</p>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={confirm.onConfirm}>{confirm.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   LANDING SCREEN
--------------------------------------------------------- */
function LandingScreen({ history, bankTotals, usedTotals, onStart, onReset }) {
  const attempts = history.length;
  const avg = attempts ? (history.reduce((s, h) => s + h.totalMarks, 0) / attempts).toFixed(1) : "—";
  const best = attempts ? Math.max(...history.map((h) => h.totalMarks)).toFixed(1) : "—";
  const recent = history.slice(-8);
  const maxBar = Math.max(1, ...recent.map((h) => h.totalMarks));

  return (
    <div className="landing">
      <div className="brandline">IBPS PO · Prelims Practice</div>
      <h1 className="h1">Full-length mock, exam conditions.</h1>
      <p className="lede">
        100 questions, 60 minutes, three sections each with their own locked timer — same as the real
        IBPS PO Preliminary exam. Every mock pulls a fresh set of questions from the bank, so repeat
        attempts won't hand you the same paper twice.
      </p>

      <div className="pattern-card">
        <div className="pattern-head">Exam pattern</div>
        <table className="pattern">
          <thead>
            <tr><th>Section</th><th>Questions</th><th>Time</th></tr>
          </thead>
          <tbody>
            <tr><td>English Language</td><td className="num">30</td><td className="num">20 min</td></tr>
            <tr><td>Quantitative Aptitude</td><td className="num">35</td><td className="num">20 min</td></tr>
            <tr><td>Reasoning Ability</td><td className="num">35</td><td className="num">20 min</td></tr>
            <tr><td>Total</td><td className="num">100</td><td className="num">60 min</td></tr>
          </tbody>
        </table>
      </div>

      <div className="cta-row">
        <button className="btn btn-primary" onClick={onStart}>Start new mock test</button>
      </div>

      {attempts > 0 && (
        <>
          <div className="section-title">Your progress</div>
          <div className="stats-row">
            <div className="stat"><div className="num mono">{attempts}</div><div className="lbl">Attempts</div></div>
            <div className="stat"><div className="num mono">{best}</div><div className="lbl">Best score</div></div>
            <div className="stat"><div className="num mono">{avg}</div><div className="lbl">Average score</div></div>
          </div>
          <div className="bar-wrap">
            {recent.map((h) => (
              <div key={h.id} className="bar" style={{ height: `${Math.max(4, (h.totalMarks / maxBar) * 60)}px` }} title={`${h.totalMarks} marks`} />
            ))}
          </div>
        </>
      )}

      <div className="section-title">Question bank coverage</div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 10, padding: "4px 18px" }}>
        {["english", "quant", "reasoning"].map((k) => (
          <div className="history-row" key={k}>
            <span style={{ textTransform: "capitalize" }}>{k === "quant" ? "Quantitative Aptitude" : k === "english" ? "English Language" : "Reasoning Ability"}</span>
            <span className="mono" style={{ color: "var(--ink-soft)" }}>{usedTotals[k]} / {bankTotals[k]} seen</span>
          </div>
        ))}
      </div>

      <button className="reset-link" onClick={onReset}>Reset practice data</button>
    </div>
  );
}

/* ---------------------------------------------------------
   INSTRUCTIONS SCREEN
--------------------------------------------------------- */
function InstructionsScreen({ mock, cycledNotice, agreed, setAgreed, onBegin, onBack }) {
  return (
    <div className="instructions">
      <h1>Before you begin</h1>
      <div className="sub">IBPS PO Prelims · 100 questions · 60 minutes</div>

      {cycledNotice && (
        <div className="cycle-note">
          The bank is running a little low in one or more sections, so this mock reuses a few questions
          you've seen before, mixed with fresh ones and shuffled options.
        </div>
      )}

      <div className="instr-card">
        <h3>Sectional timing</h3>
        <ul>
          <li>Each section has its own fixed time. Once a section's timer runs out, it locks and you move to the next.</li>
          <li>You can also choose to submit a section early and move on — but you can't come back to it.</li>
          <li>The three sections run in order: English Language → Quantitative Aptitude → Reasoning Ability.</li>
        </ul>
      </div>

      <div className="instr-card">
        <h3>Marking scheme</h3>
        <ul>
          <li>+1 mark for every correct answer.</li>
          <li>−0.25 marks for every wrong answer (negative marking).</li>
          <li>No marks are deducted for unattempted questions.</li>
        </ul>
      </div>

      <div className="instr-card">
        <h3>Navigating a question</h3>
        <ul>
          <li><strong>Save & Next</strong> — saves your answer and moves ahead.</li>
          <li><strong>Mark for Review & Next</strong> — flags the question to revisit, keeping any answer selected.</li>
          <li><strong>Clear Response</strong> — removes your selected answer for the current question.</li>
          <li>Use the question palette on the right to jump to any question within the current section.</li>
        </ul>
      </div>

      <label className="agree-row">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>I have read and understood the instructions above, and I'm ready to begin the timed test.</span>
      </label>

      <div className="cta-row">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!agreed} style={!agreed ? { opacity: 0.5, cursor: "not-allowed" } : {}} onClick={onBegin}>
          Start test — {mock.sections[0].label}
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   TEST SCREEN
--------------------------------------------------------- */
function TestScreen({ mock, sectionIdx, qIdx, answers, status, timeLeft, selectOption, goto, saveAndNext, markAndNext, clearResponse, onNextSection, onSubmit }) {
  const section = mock.sections[sectionIdx];
  const q = section.questions[qIdx];
  const selected = answers[q.id];
  const isLastSection = sectionIdx === mock.sections.length - 1;
  const low = timeLeft <= 60;

  return (
    <div className="test-wrap">
      <div className="topbar">
        <div className="title">IBPS PO Prelims — {section.label}</div>
        <div className={`timer mono ${low ? "low" : ""}`}>{formatTime(timeLeft)}</div>
      </div>
      <div className="tabbar">
        {mock.sections.map((s, i) => (
          <div key={s.key} className={`tab ${i === sectionIdx ? "active" : ""}`}>{s.label}</div>
        ))}
      </div>

      <div className="test-body">
        <div className="q-panel">
          <div className="q-num mono">Question {qIdx + 1} of {section.questions.length}</div>
          <div className="q-text">{q.q}</div>
          {q.o.map((opt, i) => (
            <label key={i} className={`option ${selected === i ? "selected" : ""}`}>
              <input type="radio" name={q.id} checked={selected === i} onChange={() => selectOption(q.id, i)} />
              <span>{opt}</span>
            </label>
          ))}

          <div className="action-row">
            <button className="btn btn-primary btn-sm" onClick={saveAndNext}>Save & Next</button>
            <button className="btn btn-ghost btn-sm" onClick={markAndNext}>Mark for Review & Next</button>
            <button className="btn btn-ghost btn-sm" onClick={clearResponse}>Clear Response</button>
          </div>

          <div className="bottombar" style={{ marginTop: 30, border: "none", padding: 0 }}>
            <button className="btn btn-ghost btn-sm" disabled={qIdx === 0} style={qIdx === 0 ? { opacity: 0.4 } : {}} onClick={() => goto(qIdx - 1)}>← Previous</button>
            {isLastSection ? (
              <button className="btn btn-primary" onClick={onSubmit}>Submit test</button>
            ) : (
              <button className="btn btn-ghost" onClick={onNextSection}>Submit section & continue →</button>
            )}
          </div>
        </div>

        <div className="palette">
          <div className="legend">
            <div className="legend-item"><span className="dot p-not-visited" /> Not visited</div>
            <div className="legend-item"><span className="dot p-not-answered" /> Not answered</div>
            <div className="legend-item"><span className="dot p-answered" /> Answered</div>
            <div className="legend-item"><span className="dot p-marked" /> Marked for review</div>
            <div className="legend-item"><span className="dot p-answered-marked" /> Answered & marked</div>
          </div>
          <div className="p-grid">
            {section.questions.map((sq, i) => {
              const st = status[sq.id] || "not-visited";
              return (
                <button key={sq.id} className={`p-btn p-${st} ${i === qIdx ? "current" : ""}`} onClick={() => goto(i)}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   RESULT SCREEN
--------------------------------------------------------- */
function ResultScreen({ result, mock, answers, reviewSection, setReviewSection, expandedQ, setExpandedQ, onRetake }) {
  const attempted = result.sectionResults.reduce((s, r) => s + r.correct + r.wrong, 0);
  const sec = mock.sections[reviewSection];

  return (
    <div className="result">
      <div className="score-hero">
        <div>
          <div className="lbl">Your score</div>
          <div className="num">{result.totalMarks} <span style={{ fontSize: 20, opacity: 0.7 }}>/ {result.totalMax}</span></div>
        </div>
        <div>
          <div className="lbl">Attempted</div>
          <div className="num" style={{ fontSize: 24 }}>{attempted} / {result.totalMax}</div>
        </div>
      </div>

      <table className="section-table">
        <thead>
          <tr><th>Section</th><th>Correct</th><th>Wrong</th><th>Unattempted</th><th>Marks</th></tr>
        </thead>
        <tbody>
          {result.sectionResults.map((r) => (
            <tr key={r.key}>
              <td>{r.label}</td>
              <td className="mono">{r.correct}</td>
              <td className="mono">{r.wrong}</td>
              <td className="mono">{r.unattempted}</td>
              <td className="mono">{r.marks}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title" style={{ marginTop: 0 }}>Review your answers</div>
      <div className="review-tabs">
        {mock.sections.map((s, i) => (
          <button key={s.key} className={`btn btn-sm ${i === reviewSection ? "btn-primary" : "btn-ghost"}`} onClick={() => setReviewSection(i)}>
            {s.label}
          </button>
        ))}
      </div>

      {sec.questions.map((q, i) => {
        const ans = answers[q.id];
        const correct = ans === q.a;
        const skipped = ans === undefined;
        const badge = skipped ? "rr-skip" : correct ? "rr-correct" : "rr-wrong";
        const badgeLabel = skipped ? "Skipped" : correct ? "Correct" : "Wrong";
        const isOpen = expandedQ === q.id;
        return (
          <div key={q.id} className="review-row" onClick={() => setExpandedQ(isOpen ? null : q.id)}>
            <div className="rr-top">
              <span className={`rr-badge ${badge}`}>{badgeLabel}</span>
              <span>Q{i + 1}. {q.q}</span>
            </div>
            {isOpen && (
              <div className="rr-detail">
                <div>Your answer: {skipped ? "— not attempted" : q.o[ans]}</div>
                <div>Correct answer: {q.o[q.a]}</div>
                <div style={{ marginTop: 6 }}>{q.exp}</div>
              </div>
            )}
          </div>
        );
      })}

      <div className="result-actions">
        <button className="btn btn-primary" onClick={onRetake}>Take another mock</button>
      </div>
    </div>
  );
}
