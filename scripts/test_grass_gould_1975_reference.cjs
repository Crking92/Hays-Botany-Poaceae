"use strict";
// Gould 1975 reference intake: published morphology is source-specific, not a new specimen or an automatic scoring assignment.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../site/visual-key-lab");
const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),"utf8"));
const source=read("source-reference-gould-1975.json");
const grasses=read("species-a.json");
const little=grasses.find(x=>x.id==="schizachyrium-scoparium");
assert.equal(source.schema_version,1);
assert.equal(source.source.id,"gould-1975-grasses-of-texas");
assert.equal(source.source.first_publication_year,1975);
assert.equal(source.source.printing_of_user_copy,"UNVERIFIED_FROM_COVER");
assert.equal(source.source_intake.printed_page,"NOT_VISIBLE_IN_PHOTO");
assert.equal(source.source_intake.taxon,little.scientific);
assert.equal(Object.hasOwn(little,"gould_source_intake"),false);
assert.equal(source.learner_diagnostic_checks.length,3);
assert.equal(grasses.length,10);
assert.deepEqual(little.traits,{head:["short_racemes"],habit:["tuft","rhizome"],ligule:["membrane"],awns:["long","none_obvious"]});
assert.equal(little.photos.length,3);
const data=new Map(source.observations.map(o=>[o.character,o]));
assert.equal(data.get("culm_height").value_cm[0],50);
assert.equal(data.get("culm_height").value_cm[1],200);
assert.equal(data.get("basal_leaf_blade").length_cm_min,25);
assert.deepEqual(data.get("sessile_spikelet").length_mm,[6,8]);
assert.deepEqual(data.get("ligule").length_mm,[1,3]);
assert.equal(data.get("chromosome_number").value_2n,40);
assert.equal(data.get("lemma_length_wording").status,"HOLD_ANATOMICAL_INTERPRETATION");
assert.equal(data.get("infraspecific_key").status,"HOLD_INCOMPLETE_SOURCE_PAGE");
assert.equal(little.diagnostic_checks.filter(d=>d.source?.includes("Gould")).length,1);
assert.equal(source.learner_diagnostic_checks.filter(d=>d.source.includes("Gould")).length,3);
assert(little.diagnostic_checks.every(d=>d.url?.startsWith("https://")));
// Later owner photos identify the originally unnumbered little bluestem species
// treatment as Gould p. 608 and include the p. 609 variety key. Preserve
// historical first-intake wording and NEVER auto-select a Hays variety.
const littleVar=source.additional_species_treatments.find(x=>x.species_id==="schizachyrium-scoparium");
assert(littleVar&&littleVar.printed_pages[0]===608&&littleVar.printed_pages[1]===609);
assert.deepEqual(littleVar.infraspecific_key.map(x=>x.code),["4B","4D","4E","4A","4C"]);
const freq=littleVar.infraspecific_key.find(x=>x.code==="4A");
assert.deepEqual(freq.pedicelled_spikelet_mm,[1.5,5]);
assert(freq.distinguishing_characters.includes("Does not produce creeping rhizomes"));
assert(littleVar.nine_main_question_guidance.habit.includes("Do not require rhizomes"));
assert(little.character_evidence.gould_1975_pages_608_609);
assert(little.character_evidence.gould_1975_pages_608_609.photo_policy==="NO_MEDIA_OR_CREDIT_EDITS");
assert.deepEqual(little.traits,{head:["short_racemes"],habit:["tuft","rhizome"],ligule:["membrane"],awns:["long","none_obvious"]});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert(html.includes("for(const c of displayedChecks)")&&html.includes("node(\"h4\",\"\",c.look)"));
// Gould p. 166: preserve source-scoped Virginia wildrye anatomy without modifying scored key files.
const virginia=read("species-d1.json").find(s=>s.id==="elymus-virginicus");
const virginiaGould=source.additional_species_treatments?.find(t=>t.species_id===virginia.id);
assert(virginiaGould,"Gould Virginia wildrye literature treatment missing");
assert.equal(virginiaGould.printed_page,166);
assert.equal(virginiaGould.illustration.includes("Fig. 84"),true);
assert.equal(virginiaGould.observations.length,11);
assert.equal(virginiaGould.learner_diagnostic_checks.length,2);
assert.equal(virginiaGould.head_decision.valid_existing_core_state,"spike");
assert.equal(virginiaGould.head_decision.invalid_lookalike_core_state,"foxtail");
assert.equal(virginiaGould.head_decision.scoring_action,"NO_NEW_STATE_OR_FILTER_EXCLUSIONS");
const virginiaObs=new Map(virginiaGould.observations.map(o=>[o.character,o]));
assert.deepEqual(virginiaObs.get("lemma_awn").lemma_awn_length_mm,[5,25]);
assert.deepEqual(virginiaObs.get("blades").blade_width_mm,[5,15]);
assert.deepEqual(virginiaObs.get("growth_habit_and_height").culm_height_cm,[60,120]);
assert.equal(virginiaObs.get("chromosome_number").value_2n,28);
assert.deepEqual(virginia.traits.head,["spike"]);
assert(!virginia.traits.head.includes("foxtail"));
assert.deepEqual(virginia.traits.awns,["long","none_obvious"]);
assert.equal(virginia.photos.length,3);
assert.equal(virginia.photos[1].creator,"Matt Lavin");
assert(html.includes('["spike","Wheat-like upright or nodding spike"'));
assert(html.includes('["foxtail","Foxtail-like bristly cylinder"'));
assert(html.includes('"elymus-virginicus",1]'),"Previously credited Virginia flowering spike should teach the spike option");
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Source-specific field checks not displayed");
assert(!html.includes('["foxtail","A dense bristly cylinder"'));

// Gould Cenchrus ciliaris photographed account: source information, not promoted scored states.
const buffel=source.additional_species_treatments?.find(t=>t.species_id==="cenchrus-ciliaris");
assert(buffel,"Gould buffelgrass species treatment missing");
assert.equal(buffel.taxon,"Cenchrus ciliaris");
assert.equal(buffel.historical_synonym_as_printed,"Pennisetum ciliare (L.) Link");
assert.equal(buffel.printed_page,"NOT_VISIBLE_IN_OWNER_PHOTO");
assert.equal(buffel.illustration_reference.includes("Fig. 294"),true);
assert.equal(buffel.observations.length,16);
assert.equal(buffel.learner_diagnostic_checks.length,3);
assert.equal(buffel.classification_decision.action,"PRESERVE_PROVISIONAL_RESEARCH_STATES_NO_NEW_SCORING");
const buffelObs=new Map(buffel.observations.map(x=>[x.character,x]));
assert.deepEqual(buffelObs.get("culm_height").height_cm,[50,100]);
assert.deepEqual(buffelObs.get("ligule").hairs_mm,[1,1.5]);
assert(buffelObs.get("ligule").details.includes("NOT an explicit measured height"));
assert.deepEqual(buffelObs.get("blade").length_cm,[8,30]);
assert.deepEqual(buffelObs.get("blade").width_mm,[2.5,8]);
assert.deepEqual(buffelObs.get("inflorescence").length_cm_mostly,[4,10]);
assert.equal(buffelObs.get("inflorescence").length_cm_parenthetical_max,13);
assert.deepEqual(buffelObs.get("bristles").length_mm,[4,10]);
assert.deepEqual(buffelObs.get("fascicles").spikelets_per_fascicle,[2,4]);
assert.deepEqual(buffelObs.get("spikelet_length").length_mm,[2.5,5.6]);
assert.deepEqual(buffelObs.get("upper_floret_lemma_length").length_mm,[2.2,5.4]);
assert.deepEqual(buffelObs.get("caryopsis").length_mm,[1.4,1.9]);
assert.deepEqual(buffelObs.get("chromosome_numbers").reported_2n,[32,34,35,36,40,44,52,54]);
assert(buffelObs.get("Texas_distribution").status.includes("NOT_BONAP"));
assert.equal(buffel.adjacent_genus_key_excerpt.taxa.length,3);
assert.equal(buffel.adjacent_genus_key_excerpt.status,"SAVE_FOR_FUTURE_SPECIES_ONLY_INCOMPLETE_COUPLET");
const research=read("hays-candidates.json").candidates.find(s=>s.id==="cenchrus-ciliaris");
const trial=read("provisional-trial-batch3.json").profiles.find(s=>s.id==="cenchrus-ciliaris");
assert(research&&trial,"Original buffelgrass source candidate/trial missing");
assert.equal(trial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(trial.traits,{head:["foxtail"],habit:[],ligule:[],awns:["bristles"]});
assert(!trial.source_scored);
assert(!["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(shard=>read("species-"+shard+".json")).some(s=>s.id==="cenchrus-ciliaris"));
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Existing Gould source-side display route missing");
assert(buffel.learner_diagnostic_checks.every(c=>c.source?.includes("Gould")&&c.url?.startsWith("https://")));


// Gould (1975) p.106: source-specific Lolium perenne data and adjacent genus key, never automatic scoring.
const rye=source.additional_species_treatments?.find(x=>x.species_id==="lolium-perenne");
assert(rye,"Gould perennial ryegrass treatment missing");
assert.equal(rye.printed_page,106);
assert.equal(rye.taxon,"Lolium perenne");
assert.equal(rye.authority_as_printed,"Lolium perenne L., Sp. Pl. 83. 1753");
assert.equal(rye.classification_decision.action,"PRESERVE_RESEARCH_TRIAL_SCORING_AND_ALL_TAXONOMIC_HOLDS");
assert.equal(rye.genus_context.genus_as_printed,"23. Lolium L.");
assert.equal(rye.genus_context.observations.length,7);
assert.deepEqual(rye.genus_context.printed_historical_key.map(x=>x.taxon_as_printed),["L. perenne","L. temulentum"]);
assert(rye.genus_context.cautions.includes("multiflorum"));
assert.equal(rye.observations.length,18);
assert.equal(rye.learner_diagnostic_checks.length,3);
const ryeObs=new Map(rye.observations.map(x=>[x.character,x]));
assert.deepEqual(ryeObs.get("culm_height").height_cm,[25,70]);
assert.deepEqual(ryeObs.get("blade_width").width_mm,[2,10]);
assert.deepEqual(ryeObs.get("spike_length").length_cm,[10,20]);
assert.deepEqual(ryeObs.get("spikelet_arrangement").spikelets_per_spike,[15,30]);
assert.deepEqual(ryeObs.get("florets_per_spikelet").florets_mostly,[5,12]);
assert.deepEqual(ryeObs.get("glume_size_and_veins").glume_length_mm,[5,10]);
assert.deepEqual(ryeObs.get("glume_size_and_veins").strong_veins,[3,7]);
assert.equal(ryeObs.get("lemma_tip_and_awn").awn_length_mm_max,8);
assert.equal(ryeObs.get("lemma_tip_and_awn").status,"SOURCE_VARIATION_HOLD_FOR_CORE_AWN_MAPPING");
assert.equal(ryeObs.get("chromosome_number").reported_2n,14);
assert(rye.learner_diagnostic_checks.every(x=>x.source.includes("Gould") && x.url.startsWith("https://")));
const ryeTrial=read("provisional-trial-batch2.json").profiles.find(x=>x.id==="lolium-perenne");
const ryeCandidate=read("hays-candidates.json").candidates.find(x=>x.id==="lolium-perenne");
assert(ryeTrial&&ryeCandidate);
assert.equal(ryeTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(ryeTrial.traits,{head:["spike"],habit:[],ligule:[],awns:["none_obvious"]});
assert.equal(ryeCandidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
assert(!["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json")).some(x=>x.id==="lolium-perenne"));
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Existing source-only display must support Lolium");


// Gould (1975) p. 160, historical Hordeum leporinum = Kew-accepted H. murinum subsp. leporinum.
const hare=source.additional_species_treatments?.find(x=>x.species_id==="hordeum-murinum");
assert(hare,"Gould hare barley literature treatment missing");
assert.equal(hare.taxon,"Hordeum leporinum");
assert.equal(hare.printed_page,160);
assert.equal(hare.illustration_reference.includes("Fig. 81"),true);
assert.equal(hare.taxonomic_crosswalk.accepted_name,"Hordeum murinum subsp. leporinum (Link) Arcang.");
assert.equal(hare.taxonomic_crosswalk.current_rank,"subspecies");
assert.equal(hare.taxonomic_crosswalk.current_concept_scope,"SUBSPECIES_LEPORINUM_ONLY");
assert(hare.taxonomic_crosswalk.accepted_taxon_url.includes("powo.science.kew.org"));
assert(hare.taxonomic_crosswalk.usda_synonym_url.includes("grin"));
assert(hare.taxonomic_crosswalk.bibliographic_discrepancy.includes("1834"));
assert.equal(hare.classification_decision.action,"DO_NOT_CHANGE_EXISTING_PROVISIONAL_HEAD_HABIT_LIGULE_AWN_SCORES");
assert.equal(hare.observations.length,18);
assert.equal(hare.learner_diagnostic_checks.length,3);
const hareObs=new Map(hare.observations.map(x=>[x.character,x]));
assert.deepEqual(hareObs.get("culm").height_cm_mostly,[15,60]);
assert.deepEqual(hareObs.get("leaf_blade").width_mm_mostly,[3,8]);
assert.deepEqual(hareObs.get("leaf_blade").length_cm,[6,15]);
assert.equal(hareObs.get("ligule").height_mm_approx,1);
assert.deepEqual(hareObs.get("inflorescence").length_cm,[4,8]);
assert.deepEqual(hareObs.get("glume_awn").length_cm_mostly,[1,2.5]);
assert.deepEqual(hareObs.get("lemma_body_and_awn").lemma_body_length_mm,[6,12]);
assert.deepEqual(hareObs.get("lemma_body_and_awn").lemma_awn_length_mm,[10,35]);
assert.equal(hareObs.get("chromosome_number").reported_2n,28);
assert.equal(hareObs.get("adjacent_previous_treatment").status,"NOT_LEPORINUM_DO_NOT_TRANSFER");
assert.equal(hareObs.get("historical_Texas_distribution").status,"PARTIAL_TEXT_HISTORICAL_ONLY");
assert(hare.learner_diagnostic_checks.every(x=>x.source.includes("Gould") && x.url.startsWith("https://")));
const barleyTrial=read("provisional-trial-batch3.json").profiles.find(x=>x.id==="hordeum-murinum");
const barleyCandidate=read("hays-candidates.json").candidates.find(x=>x.id==="hordeum-murinum");
assert(barleyTrial&&barleyCandidate);
assert.equal(barleyTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(barleyTrial.traits,{head:["spike"],habit:[],ligule:[],awns:["long"]});
assert.equal(barleyCandidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
assert(!["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json")).some(x=>x.id==="hordeum-murinum"));
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Existing source-specific display must support hare barley");


// Gould, The Grasses of Texas, printed p.173: Triticum aestivum, old genus key, and unit discrepancy.
const wheat=source.additional_species_treatments?.find(x=>x.species_id==="triticum-aestivum");
assert(wheat,"Source register must retain Gould wheat p.173");
assert.equal(wheat.printed_page,173);
assert.equal(wheat.taxon,"Triticum aestivum");
assert.equal(wheat.observations.length,22);
assert.equal(wheat.learner_diagnostic_checks.length,3);
assert.equal(wheat.genus_context.historical_two_choice_key.length,2);
assert.equal(wheat.genus_context.historical_two_choice_key[1].modern_name,"Aegilops cylindrica Host");
assert.equal(wheat.genus_context.historical_two_choice_key[1].modern_species_id,"aegilops-cylindrica");
assert.equal(wheat.genus_context.modern_name_crosswalk.accepted_name,"Aegilops cylindrica Host");
assert.equal(wheat.classification_decision.action,"PRESERVE_PROVISIONAL_IDENTIFICATION_STATES_AND_UNCERTAINTY");
const wheatObs=new Map(wheat.observations.map(x=>[x.character,x]));
assert.deepEqual(wheatObs.get("culm_height").height_cm_mostly,[60,100]);
assert.deepEqual(wheatObs.get("blade_width_and_surface").width_mm_equivalent,[7,20]);
assert.deepEqual(wheatObs.get("inflorescence_spike").length_cm,[5,12]);
assert.deepEqual(wheatObs.get("spikelet_length").length_mm,[10,15]);
assert.deepEqual(wheatObs.get("spikelet_florets").florets_per_spikelet,[2,5]);
assert.deepEqual(wheatObs.get("chromosome_number").reported_2n,42);
assert.deepEqual(wheatObs.get("embryo_relative_length").embryo_fraction_of_endosperm,[0.25,1/3]);
assert.equal(wheatObs.get("ligule").literal_source_length,"1–3 cm");
assert.equal(wheatObs.get("ligule").status,"PUBLISHED_UNIT_DISCREPANCY_HOLD");
assert(wheatObs.get("ligule").comparison_sources.some(x=>x.reported_length==="2–3 mm"));
assert.equal(wheatObs.get("glume_awn").reported_maximum,"6 cm or more");
assert.equal(wheatObs.get("lemma_awn").reported_maximum,"15 cm or more");
assert(wheat.learner_diagnostic_checks.every(x=>x.source.includes("Gould")&&x.url?.startsWith("https://")));
const wheatTrial=read("provisional-trial-batch3.json").profiles.find(x=>x.id==="triticum-aestivum");
const wheatCandidate=read("hays-candidates.json").candidates.find(x=>x.id==="triticum-aestivum");
assert(wheatTrial&&wheatCandidate);
assert.equal(wheatTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(wheatTrial.traits,{head:["spike"],habit:[],ligule:["membrane"],awns:[]});
assert.equal(wheatCandidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
assert(!["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json")).some(x=>x.id==="triticum-aestivum"));
const goatTrial=read("provisional-trial-batch2.json").profiles.find(x=>x.id==="aegilops-cylindrica");
assert.equal(goatTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(goatTrial.traits,{head:["spike"],habit:[],ligule:["membrane"],awns:["long"]});
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Wheat source-only diagnostic text requires existing display route");


// Gould Paspalum page: keep bahiagrass separate from sour paspalum, matted paspalum and var. saurae.
const bahia=source.additional_species_treatments?.find(x=>x.species_id==="paspalum-notatum");
const sour=source.additional_species_treatments?.find(x=>x.species_id==="paspalum-conjugatum");
const mat=source.additional_species_treatments?.find(x=>x.species_id==="paspalum-minus");
assert(bahia && sour && mat,"Gould Paspalum source treatments missing");
assert.equal(bahia.taxon,"Paspalum notatum");
assert.equal(sour.taxon,"Paspalum conjugatum");
assert.equal(mat.taxon,"Paspalum minus");
assert.equal(bahia.printed_page,"NOT_VISIBLE_IN_USER_PHOTO");
assert.equal(sour.printed_page,"NOT_VISIBLE_IN_USER_PHOTO");
assert.equal(mat.treatment_completeness,"PARTIAL_TEXT_ONLY_NEXT_PAGE_REQUIRED");
assert.equal(bahia.observations.length,14);
assert.equal(sour.observations.length,12);
assert.equal(mat.observations.length,4);
assert.equal(bahia.learner_diagnostic_checks.length,3);
assert.equal(sour.learner_diagnostic_checks.length,0);
assert.equal(mat.learner_diagnostic_checks.length,0);
const bObs=new Map(bahia.observations.map(x=>[x.character,x]));
assert.deepEqual(bObs.get("culm_height").mostly_cm,[20,75]);
assert.deepEqual(bObs.get("blade_width").width_mm,[2,6]);
assert.deepEqual(bObs.get("inflorescence").branch_length_cm,[4,12]);
assert.equal(bObs.get("inflorescence").branches_typical,2);
assert.deepEqual(bObs.get("spikelet_shape_surface_size").length_mm,[2.8,3.5]);
assert.deepEqual(bObs.get("chromosome_numbers").reported_2n,[20,30,40]);
assert.equal(bObs.get("ligule").status,"ANATOMICAL_CLASSIFICATION_REVIEW_HOLD");
assert(bObs.get("ligule").details.includes("membranous"));
assert.equal(bahia.historical_variety.current_taxonomic_conflict.kew_accepted_name,"Paspalum saurae (Parodi) Parodi");
assert.equal(bahia.historical_variety.current_taxonomic_conflict.resolution,"HOLD_AUTHORITIES_DIFFER_KEEP_SEPARATE_TAXON_CONCEPTS");
const sourObs=new Map(sour.observations.map(x=>[x.character,x]));
assert.deepEqual(sourObs.get("flowering_branches").length_cm_mostly,[5,15]);
assert.deepEqual(sourObs.get("spikelet_size_arrangement").length_mm_mostly,[1.5,2]);
assert.equal(sourObs.get("chromosome_count").reported_2n,40);
assert(sour.bibliographic_date_hold.includes("1772"));
const matObs=new Map(mat.observations.map(x=>[x.character,x]));
assert.deepEqual(matObs.get("spikelets").length_mm,[2,2.5]);
assert.equal(matObs.get("culm_height_and_mat").height_cm_rarely_over,30);
assert(mat.audit_hold.includes("Only the beginning"));
const bTrial=read("provisional-trial-batch2.json").profiles.find(x=>x.id==="paspalum-notatum");
const bCandidate=read("hays-candidates.json").candidates.find(x=>x.id==="paspalum-notatum");
assert(bTrial && bCandidate);
assert.equal(bTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.deepEqual(bTrial.traits,{head:["paired_spikes","one_sided"],habit:["mat","rhizome"],ligule:["hairs"],awns:[]});
assert.equal(bCandidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
const catalog=read("hays-candidates.json").candidates;
assert(!catalog.some(x=>["paspalum-conjugatum","paspalum-minus"].includes(x.id)),"Adjacent pages must not create unverified Lab species");
assert(!["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json")).some(x=>["paspalum-notatum","paspalum-conjugatum","paspalum-minus"].includes(x.id)));
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Existing Gould display route must show bahiagrass diagnostic checks");
assert(bahia.learner_diagnostic_checks.every(x=>x.source.includes("Gould") && x.url.startsWith("https://")));


// Final owner-supplied Gould pages: Paspalum langei p.510, Pappophorum bicolor p.378,
// and three adjacent treatments with protected historical taxonomic concepts.
const langei=source.additional_species_treatments.find(t=>t.species_id==="paspalum-langei");
const bicolor=source.additional_species_treatments.find(t=>t.species_id==="pappophorum-bicolor");
const separatum=source.additional_species_treatments.find(t=>t.species_id==="paspalum-separatum");
const mono=source.additional_species_treatments.find(t=>t.species_id==="paspalum-monostachyum");
const vag=source.additional_species_treatments.find(t=>t.species_id==="pappophorum-vaginatum");
assert(langei&&bicolor&&separatum&&mono&&vag);
assert.equal(langei.printed_page,510);
assert.equal(bicolor.printed_page,378);
assert.equal(langei.taxonomy.status,"CURRENT_NAME_ACCEPTED");
assert.equal(bicolor.taxonomy.status,"CURRENT_NAME_ACCEPTED");
assert.equal(langei.observations.length,16);
assert.equal(bicolor.observations.length,21);
assert.equal(langei.learner_diagnostic_checks.length,2);
assert.equal(bicolor.learner_diagnostic_checks.length,3);
const lo=new Map(langei.observations.map(x=>[x.character,x]));
assert.deepEqual(lo.get("culm_height").height_cm,[30,100]);
assert.deepEqual(lo.get("leaf_blade").width_mm_mostly,[7,18]);
assert.deepEqual(lo.get("inflorescence_branch_count").usually,[2,5]);
assert.deepEqual(lo.get("inflorescence_branch_length").length_cm_mostly,[4,8]);
assert.deepEqual(lo.get("spikelet_length_and_shape").length_mm,[2.2,2.6]);
assert.deepEqual(lo.get("first_glume").fraction_spikelet_length,[0.25,1/3]);
assert(lo.get("second_glume_and_lower_lemma").details.includes("glandular"));
assert.equal(lo.get("chromosome_number").reported_2n,60);
const bo=new Map(bicolor.observations.map(x=>[x.character,x]));
assert.deepEqual(bo.get("culm_height_posture").height_cm_mostly,[30,80]);
assert.deepEqual(bo.get("blade_base_hairs").hair_length_mm,[2,4]);
assert.deepEqual(bo.get("blade").width_mm,[1.5,5]);
assert.deepEqual(bo.get("panicle_length").length_cm_mostly,[12,20]);
assert.deepEqual(bo.get("floret_counts").perfect_florets,[2,3]);
assert.equal(bo.get("floret_counts").reduced_florets_above,2);
assert.deepEqual(bo.get("lemma_awns").awn_count_per_lemma,[11,15]);
assert.deepEqual(bo.get("lemma_awns").longest_awn_mm,[2.5,5]);
assert.equal(bo.get("chromosome_number").reported_2n,100);
assert(bo.get("ligule").details.includes("ring of short hairs"));
assert(bicolor.genus_key_context.second_choice.name.includes("vaginatum"));
assert.equal(separatum.observations.length,10);
assert.equal(mono.observations.length,7);
assert.equal(vag.observations.length,4);
assert.equal(separatum.taxonomy.current_kew_name,"Paspalum setaceum var. setaceum");
assert.equal(vag.taxonomy.kew_accepted_name,"Pappophorum mucronulatum Nees");
assert.equal(vag.taxonomy.grin_accepted_name,"Pappophorum vaginatum Buckley");
assert.equal(vag.taxonomy.conflict_status,"DISAGREEMENT_KEEP_BOTH_TAXON_CONCEPTS");
assert.equal(mono.evidence_level,"PARTIAL_ADJACENT_SPECIES_TREATMENT_ONLY");
const lTrial=read("provisional-trial-batch4.json").profiles.find(x=>x.id==="paspalum-langei");
const lCandidate=read("hays-candidates.json").candidates.find(x=>x.id==="paspalum-langei");
const bCandidate2=read("hays-candidates.json").candidates.find(x=>x.id==="pappophorum-bicolor");
assert(lTrial&&lCandidate&&bCandidate2);
assert.deepEqual(lTrial.traits,{head:["one_sided","paired_spikes"],habit:["tuft"],ligule:[],awns:[]});
assert.equal(lTrial.admission_status,"RESEARCH_TRIAL_NOT_ADMITTED");
assert.equal(bCandidate2.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
assert(!read("hays-candidates.json").candidates.some(x=>["paspalum-separatum","paspalum-monostachyum","pappophorum-vaginatum"].includes(x.id)));
const allScored=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json"));
assert(!allScored.some(x=>["paspalum-langei","pappophorum-bicolor"].includes(x.id)),"Do not silently promote source-only species");
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"));
assert([...langei.learner_diagnostic_checks,...bicolor.learner_diagnostic_checks].every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));


// Owner's five Gould pages, partial companion paragraphs, and current taxon-name crosswalks.
const latestNames=["stapfochloa-canterae","sphenopholis-nitida","sphenopholis-interrupta","phanopyrum-gymnocarpon","steinchisma-hians","urochloa-mutica"];
const newRefs=latestNames.map(id=>source.additional_species_treatments.find(t=>t.species_id===id));
assert(newRefs.every(Boolean),"Gould five photo page treatments all present");
assert.equal(new Set(source.additional_species_treatments.map(x=>x.species_id)).size,source.additional_species_treatments.length,"No duplicate Gould species links");
assert.deepEqual(newRefs.map(r=>r.observations.length),[20,11,16,14,16,8]);
assert.deepEqual(newRefs.map(r=>r.learner_diagnostic_checks.length),[2,0,2,0,2,0]);
// Owner supplies new Gould page images over time: retain at least the
// 30 already indexed treatments, but do not hard-code a fixed total that
// breaks every time a new independently sourced species page is received.
assert(source.additional_species_treatments.length>=30,"Retain all 30 previously captured Gould taxon treatments");
const [rabbit,ditch,nitgrass]=["polypogon-monspeliensis","polypogon-interruptus","gastridium-ventricosum"]
  .map(id=>source.additional_species_treatments.find(x=>x.species_id===id));
assert(rabbit&&ditch&&nitgrass,"Owner's Gould pp.145 and 147: distinct taxa retained");
assert.equal(rabbit.printed_page,145);
assert.equal(rabbit.continuation_page,147);
assert(rabbit.source_images.includes("146 was NOT supplied"));
assert.deepEqual(rabbit.observations.find(x=>x.character==="leaf_blade").width_mm_mostly,[2,8]);
assert.deepEqual(rabbit.observations.find(x=>x.character==="ligule").length_mm,[4,10]);
assert.deepEqual(ditch.observations.find(x=>x.character==="spikelet_glumes").glume_body_mm,[2,3]);
assert.equal(nitgrass.taxon,"Gastridium ventricosum (Gouan) Schinz & Thell.");
const annualProfile=read("species-d3.json").find(x=>x.id==="polypogon-monspeliensis");
const slenderProfile=read("species-d4.json").find(x=>x.id==="sorghastrum-elliottii");
assert(annualProfile&&slenderProfile);
assert(annualProfile.character_evidence.gould_1975_pages_145_147);
assert(slenderProfile.character_evidence.polypogon_beginner_pairwise_20261116);
assert.deepEqual(annualProfile.traits,{head:["compact","long_narrow_panicle"],habit:["tuft","mat"],ligule:["membrane"],awns:["long"]});
assert.deepEqual(slenderProfile.traits,{head:["golden_plume","long_narrow_panicle"],habit:["tuft"],ligule:["membrane"],awns:["long"]});
const [canterae,nitida,interrupta,gymnocarpon,hians,mutica]=newRefs;
assert.equal(canterae.taxon_as_printed,"Chloris canterai");
assert.equal(canterae.taxonomy.currently_accepted,"Stapfochloa canterae (Arechav.) P.M.Peterson");
assert.equal(canterae.taxonomy.original_corrected_spelling,"Chloris canterae Arechav.");
assert.equal(canterae.printed_page,328);
assert.equal(canterae.original_unconfirmed_page_status,"NOT_VISIBLE_IN_USER_PHOTO");
assert.equal(canterae.current_verified_printed_page,328);
assert(canterae.adjacent_page_material.some(x=>x.taxon==="Chloris ciliata"&&x.description.includes("NOT")));
const co=new Map(canterae.observations.map(x=>[x.character,x]));
assert.equal(co.get("ligule").hair_length_mm_max,7);
assert.deepEqual(co.get("panicle_digitations").branch_count_usual,[3,6]);
assert.deepEqual(co.get("panicle_digitations").branch_count_occasional,[2,9]);
assert.deepEqual(co.get("raceme_length").branch_length_cm,[4,14]);
assert.deepEqual(co.get("first_glume_length").length_mm,[1.6,2.4]);
assert.deepEqual(co.get("second_glume_length").length_mm,[2.3,3.8]);
assert.deepEqual(co.get("lower_fertile_lemma_awn").length_mm,[2.4,5.5]);
assert.deepEqual(co.get("lowest_sterile_awn").awn_length_mm,[1.5,3.5]);
assert.equal(co.get("chromosome_number").reported_2n,36);
assert.equal(nitida.printed_page,130);
assert.equal(nitida.completeness.startsWith("PARTIAL"),true);
assert.equal(nitida.taxonomy.status,"STILL_ACCEPTED_SPECIES");
assert.deepEqual(new Map(nitida.observations.map(x=>[x.character,x])).get("spikelets").length_mm,[2.5,4]);
assert.deepEqual(interrupta.printed_pages,[130,131]);
assert.equal(interrupta.taxonomy.accepted_name,"Sphenopholis interrupta (Buckley) Scribn.");
const so=new Map(interrupta.observations.map(x=>[x.character,x]));
assert.deepEqual(so.get("ligule").length_mm,[1.5,2]);
assert.deepEqual(so.get("spikelet_size_florets").length_mm_excluding_awns,[4,6]);
assert.deepEqual(so.get("lemma_awn").length_mm_mostly,[5,8]);
assert(so.get("lemma_awn").details.includes("TWICE geniculate"));
assert.equal(so.get("chromosome_number").reported,null);
assert.equal(gymnocarpon.taxonomy.status,"ACCEPTED_GENUS_DISAGREEMENT");
assert(gymnocarpon.taxonomy.usda_itis_accepted.startsWith("Phanopyrum"));
const go=new Map(gymnocarpon.observations.map(x=>[x.character,x]));
assert.deepEqual(go.get("ligule").length_mm,[0.6,1]);
assert.deepEqual(go.get("spikelets").length_mm,[5.5,7]);
assert.equal(go.get("chromosome_number").reported,null);
assert.equal(hians.taxon_as_printed.startsWith("Panicum hians"),true);
assert.equal(hians.taxonomy.accepted_name,"Steinchisma hians (Elliott) Nash");
const ho=new Map(hians.observations.map(x=>[x.character,x]));
assert.deepEqual(ho.get("culm_height").height_cm_mostly,[20,75]);
assert.deepEqual(ho.get("bare_primary_branch_base").bare_length_cm,[1.5,3]);
assert.deepEqual(ho.get("spikelets").length_mm,[1.8,2.6]);
assert.equal(ho.get("chromosome_number").reported_2n,20);
assert(ho.get("lower_neuter_floret").details.includes("inflated"));
assert.equal(mutica.taxonomy.accepted_name,"Urochloa mutica (Forssk.) T.Q.Nguyen");
assert(mutica.completeness.startsWith("PARTIAL_ADJACENT"));
const mo=new Map(mutica.observations.map(x=>[x.character,x]));
assert.equal(mo.get("ligule").fringe_length_mm_approx,1.5);
assert.deepEqual(mo.get("blades").width_cm,[0.5,1.5]);
assert.deepEqual(mo.get("spikelets").length_mm,[2.8,3.4]);
const candidateIds=read("hays-candidates.json").candidates.map(x=>x.id);
for(const id of ["stapfochloa-canterae","sphenopholis-interrupta","steinchisma-hians"])assert(candidateIds.includes(id),"Existing research-candidate species missing: "+id);
for(const id of ["sphenopholis-nitida","phanopyrum-gymnocarpon","urochloa-mutica"])assert(!candidateIds.includes(id),"Literature-only adjacent species must not be added to 57-species roster: "+id);
const scoredInventory=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json"));
assert.equal(scoredInventory.length,112);
assert(!scoredInventory.some(x=>latestNames.includes(x.id)),"Gould literature save must not silently promote new species");
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"),"Existing future Gould source-side field checks not wired");
assert([...canterae.learner_diagnostic_checks,...interrupta.learner_diagnostic_checks,...hians.learner_diagnostic_checks].every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));


// Gould pp.213,542,469: NEW historical-name crosswalks, distinct morphology, and duplicate-page guard.
const tri=source.additional_species_treatments.find(x=>x.species_id==="tridentopsis-elongata");
const nat=source.additional_species_treatments.find(x=>x.species_id==="melinis-repens");
const gui=source.additional_species_treatments.find(x=>x.species_id==="megathyrsus-maximus");
assert(tri && nat && gui,"New Gould Tridentopsis, Melinis and Megathyrsus intakes missing");
assert.equal(source.additional_species_treatments.filter(x=>["tridentopsis-elongata","melinis-repens","megathyrsus-maximus"].includes(x.species_id)).length,3);
assert.equal(tri.printed_page,213);
assert.equal(nat.printed_page,542);
assert.equal(gui.printed_page,469);
assert.deepEqual([tri.observations.length,nat.observations.length,gui.observations.length],[9,13,18]);
assert.deepEqual([tri.learner_diagnostic_checks.length,nat.learner_diagnostic_checks.length,gui.learner_diagnostic_checks.length],[2,2,2]);
assert.equal(tri.taxonomy.current_accepted_name,"Tridentopsis elongata (Buckley) Wipff & Weakley");
assert(tri.taxonomy.status.includes("KEW_ACCEPTS_SEPARATE_SPECIES"));
assert.equal(tri.historical_couplet_comparison.typical_variety.second_glume_veins,1);
assert.deepEqual(tri.historical_couplet_comparison.elongatus_variety.second_glume_veins,[3,7]);
assert.deepEqual(tri.historical_couplet_comparison.elongatus_variety.account_second_glume_mm,[5.5,10]);
assert.equal(tri.historical_couplet_comparison.typical_variety.modern_concept,"Tridentopsis mutica (Torr.) P.M.Peterson");
assert.equal(nat.taxonomy.accepted_name,"Melinis repens (Willd.) Zizka");
assert.equal(nat.taxon,"Rhynchelytrum repens (Willd.) C.E.Hubb.");
const natObs=new Map(nat.observations.map(o=>[o.character,o]));
assert.deepEqual(natObs.get("ligule").hair_length_mm,[0.5,1]);
assert.deepEqual(natObs.get("panicle_shape").length_cm,[6,20]);
assert.equal(nat.adjacent_genus_context.taxon,"Setaria P.Beauv.");
assert(nat.adjacent_genus_context.caution.includes("Setaria"));
assert.equal(gui.taxonomy.accepted_name,"Megathyrsus maximus (Jacq.) B.K.Simon & S.W.L.Jacobs");
assert.equal(gui.taxon,"Panicum maximum Jacq.");
const guiObs=new Map(gui.observations.map(o=>[o.character,o]));
assert.deepEqual(guiObs.get("culm_height").height_m,[1,2.5]);
assert.deepEqual(guiObs.get("panicle_length_architecture").length_cm,[20,50]);
assert.deepEqual(guiObs.get("spikelet_length").length_mm,[3,3.5]);
assert.deepEqual(guiObs.get("ligule").marginal_hair_length_mm,[3,4]);
assert.deepEqual(guiObs.get("chromosome_reports").other_reported_2n,[18,36,44,48]);
assert.equal(guiObs.get("chromosome_reports").frequent_2n,32);
assert(guiObs.get("historical_Texas_introduction").details.includes("Kew now"));
assert.equal(gui.adjacent_partial_note.taxon_as_printed,"Panicum diffusum Sw.");
assert.equal(gui.adjacent_partial_note.status,"PARTIAL_ADJACENT_TREATMENT_ONLY_NOT_MEGATHYRSUS");
assert(source.additional_source_image_notes.some(x=>x.note.includes("NOT duplicated")));
const candidateSet=new Set(read("hays-candidates.json").candidates.filter(x=>x.status==="RESEARCH_CANDIDATE_NOT_RELEASED").map(x=>x.id));
for(const id of ["tridentopsis-elongata","melinis-repens","megathyrsus-maximus"])assert(candidateSet.has(id),"Gould source-only record cannot promote: "+id);
assert(!candidateSet.has("panicum-diffusum"),"Partial neighbor must not be added from one image");
const scoredFinal=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json"));
assert.equal(scoredFinal.length,112);
assert(!scoredFinal.some(x=>["tridentopsis-elongata","melinis-repens","megathyrsus-maximus"].includes(x.id)),"Cannot silently promote Gould new evidence");
assert(html.includes("gouldAdditional?.learner_diagnostic_checks"));
for(const e of [tri,nat,gui])assert(e.learner_diagnostic_checks.every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));

// Owner's new Gould photos are source-specific but cannot settle the three
// H&L underground rhizome conflicts from silence / alternative basal wording.
const rhizomeIds=["bouteloua-dactyloides","eragrostis-intermedia","hopia-obtusa"];
const [buffalo,plains,vine]=rhizomeIds.map(id=>source.additional_species_treatments.find(t=>t.species_id===id));
assert.deepEqual([buffalo.printed_page,plains.printed_page,vine.printed_page],
 [355,182,"NOT_VISIBLE_IN_USER_PHOTO"]);
assert.equal(buffalo.taxon,"Buchloë dactyloides (Nutt.) Engelm.");
assert.deepEqual(buffalo.observations.find(x=>x.character==="blade").width_mm_mostly,[1,2.5]);
assert.equal(buffalo.observations.find(x=>x.character==="ligule").membrane_length_mm_approx,0.5);
assert.equal(plains.observations.find(x=>x.character==="spikelet_florets").florets[0],5);
assert.equal(vine.taxon,"Panicum obtusum H.B.K.");
assert(vine.observations.find(x=>x.character==="habit").source_wording.includes("or rhizomatous base"));
for(const ref of [buffalo,plains,vine]){
 assert(ref.observations.find(x=>x.character==="rhizome_review").decision==="KEEP_RHIZOME_HOLD");
 assert(ref.preservation.includes("NOT rehosted"));
 assert(ref.classification_decision.action.includes("HOLD"));
 assert(ref.learner_diagnostic_checks.every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));
 const scored=["a","b","c1","c2","c3","d1","d2","d3","d4"].flatMap(k=>read("species-"+k+".json")).find(x=>x.id===ref.species_id);
 assert(scored?.traits.habit.includes("rhizome"),ref.species_id+": conflict source preserved without blind scoring changes");
}
// Owner's preferred Gould + Diggs resolution is a NEW scoring policy note;
// do not mutate the original photographs, book-paraphrase hold history, or
// 112 source taxa just to change how Still possible vs match is presented.
const newer=source.current_source_priority_rhizome_review;
assert.equal(newer.adopted_on,"2026-11-16");
assert.deepEqual(newer.decisions.map(x=>x.species_id),
 ["bouteloua-dactyloides","eragrostis-intermedia","hopia-obtusa"]);
assert.deepEqual(newer.decisions.map(x=>x.current_key_status),
 ["UNRESOLVED_STILL_POSSIBLE","UNRESOLVED_STILL_POSSIBLE","PRIMARY_SOURCE_CONFIRMED_BASAL_RHIZOME"]);
assert(newer.decisions[2].flora.includes("p.1300")&&newer.decisions[2].flora.includes("rhizomatous"));
assert(newer.decisions[0].gould.includes("p.355"));
assert(newer.decisions[1].gould.includes("p.182"));
assert(html.includes("Diggs et al., Flora of North Central Texas (1999), printed p.1300"));
assert(html.includes("easternGamagrassSexPhotoComparison"),"Three-photo sex anatomy gallery missing from field key");
// Beginner ligule UI: extra edge illustrations may refine ranking, but
// never become a tenth question, a new species score or an exclusion rule.
const liguleGlossary=read("grass-glossary-terms.json").terms;
for(const key of ["membranous-ligule","hair-fringe-ligule","ciliate","erose","lacerate","entire-ligule-edge"]){
 assert(liguleGlossary[key]?.plain&&liguleGlossary[key]?.where,"Missing collar definition: "+key);
}
assert(html.includes('function renderLiguleSections(area,q,buildChoice)'));
assert(html.includes('function collarOrientationSketch()'));
assert(html.includes('q.id==="ligule"'));
assert(html.includes('["hairs","Mostly a fringe of hairs"'));
assert(html.includes('["membrane","Papery membrane (edge may have hairs)"'));
assert(html.includes('["absent","No ligule visible"'));
assert(html.includes('edge.multi_select?'));
assert(html.includes('state.refineSelected.ligule_edge'));
assert(html.includes('hit.character==="ligule_edge"&&state.selected.ligule'),
 "Membrane and edge must not double-count the same collar as separate score points");
assert(html.includes('function supportedLiguleEdge(s)'),
 "Published edge detail should be available as an unweighted tie-break");
assert(html.includes('One membrane can be both')===false,
 "Single-select edge picker must not promise simultaneous choices");
const exclusionBlock=html.slice(html.indexOf("const advancedExclusionPolicy="),html.indexOf("function verifiedAdvancedConflict("));
assert(!exclusionBlock.includes("ligule_edge"),"An uncertain ligule-edge choice must never become a hard negative exclusion");
assert(html.includes('ligule_edge:["entire"')===false,
 "Existing detailed ligule option IDs must remain runtime-driven rather than a new scoring table");
assert.equal(read("species-c3.json").find(x=>x.id==="tripsacum-dactyloides").traits.ligule.includes("membrane"),true);

// Owner-photographed Gould p.321 Chloris verticillata source intake.
const tumbleGould=source.additional_species_treatments.find(x=>x.species_id==="chloris-verticillata");
const tumbleCard=read("species-a.json").find(x=>x.id==="chloris-verticillata");
assert(tumbleGould&&tumbleGould.printed_page===321,"Exact owner-supplied p.321 record must remain");
assert(tumbleCard?.character_evidence?.gould_1975_page_321,"Gould evidence linked to correct Learner species");
assert.equal(tumbleGould.observations.find(x=>x.character==="ligule").cilia_max_mm,2,
 "2mm hair length belongs to cilia, not membrane-height score");
assert.equal(tumbleGould.observations.find(x=>x.character==="ligule").membrane_mm_from_Gould,"NOT_REPORTED");
assert.deepEqual(tumbleGould.observations.find(x=>x.character==="flowerhead").whorls,[2,5]);
assert.deepEqual(tumbleGould.observations.find(x=>x.character==="lower_fertile_floret_lemma").awn_length_mm,[4.8,9]);
assert.deepEqual(tumbleGould.observations.find(x=>x.character==="sterile_floret").awn_length_mm,[3.2,7]);
assert(tumbleGould.observations.find(x=>x.character==="hybridization").other_taxon==="Chloris cucullata");
assert.deepEqual(tumbleCard.traits,{head:["whorls","one_sided","many_one_sided"],habit:["tuft","mat"],ligule:["membrane","hairs"],awns:["long"]},"No unintended four-core score change");
assert.equal(tumbleCard.range,"UNRESOLVED");
assert.equal(tumbleCard.photos.length,8,"Existing photo gallery unchanged");

console.log("PASS: three new Gould photographed passages source-pinned, page holds intact and no false rhizome conclusions");
console.log("PASS: Gould p.213 Tridentopsis elongata, p.542 Melinis repens and p.469 Megathyrsus maximus saved, preserving protected key scoring");

// Exact owner-supplied Gould p.622 Tripsacum record: source-only, no silent
// acceptance of adjacent incomplete Zea mays or contradictory female glume
// developmental texture as an exclusion score.
const gamagrass622=source.additional_species_treatments.find(x=>x.species_id==='tripsacum-dactyloides'&&x.printed_page===622);
assert(gamagrass622,'Gould p.622 eastern gamagrass source intake missing');
assert.equal(gamagrass622.observations.find(x=>x.character==='leaf_blades').usual_width_mm[1],25);
assert.equal(gamagrass622.observations.find(x=>x.character==='ligule').states[0],'membrane_with_cilia');
assert.equal(gamagrass622.observations.find(x=>x.character==='inflorescence').sex_position,'staminate_above_pistillate');
assert.equal(gamagrass622.observations.find(x=>x.character==='female_glume_texture_internal_source_tension').status,'SOURCE_INTERNAL_TEXTURE_SCOPE_HOLD_NO_SCORING_CHANGE');
assert.equal(gamagrass622.adjacent_account_boundary.taxon,'Zea mays L.');
assert.equal(gamagrass622.learner_diagnostic_checks.length,2);
assert(source.additional_species_treatments.length>=31,'Gould source records unexpectedly lost');

// Lindheimer's muhly field specimen: Gould (1975) p.261 was supplied as a
// photograph by the owner. Preserve the exact species organ distinction
// (UPPER leaf-blade pubescence versus possible lemma puberulence), measurements
// and venation UNKNOWN. This is a source test, not a specimen/rights clearance.
{
 const gould=source.additional_species_treatments.filter(x=>x.species_id==="muhlenbergia-lindheimeri");
 assert.equal(gould.length,1,"Do not create duplicate Lindheimer Gould intakes");
 const row=gould[0],card=read("species-c3.json").find(x=>x.id===row.species_id);
 assert(card,"Lindheimer card not found");
 assert.deepEqual(row.printed_pages,[261]);
 assert.equal(row.printed_figure,137);
 assert.equal(row.taxon,"Muhlenbergia lindheimeri Hitchc.");
 assert.match(row.protologue_as_printed,/1934/);
 assert.equal(row.intake_batch,"20261118");
 assert.equal(row.observations.length,9);
 const blade=row.observations.find(x=>x.character==="leaf_blade");
 const membrane=row.observations.find(x=>x.character==="ligule");
 const head=row.observations.find(x=>x.character==="panicle");
 const awns=row.observations.find(x=>x.character==="lemmas_and_awns");
 assert.deepEqual(blade.width_mm_typical,[2,3]);
 assert.deepEqual(blade.width_mm_extended,[2,5]);
 assert.deepEqual(blade.length_cm_typical,[10,45]);
 assert.equal(blade.length_cm_max,50);
 assert(/upper\/(adaxial|UPPER)|upper/i.test(blade.surface));
 assert.deepEqual(membrane.length_mm,[8,15]);
 assert.deepEqual(head.length_cm_extended,[15,50]);
 assert.deepEqual(head.width_cm_extended,[0.6,3]);
 assert.equal(awns.awn_mm_max_rare,4);
 assert.equal(row.observations.find(x=>x.character==="palea_anther_chromosome").chromosome_2n,20);
 assert.equal(card.character_evidence.blade_hairs.status,"DIRECT_OWNER_PHOTOGRAPHED_EXACT_SPECIES_SOURCE_POSITIVE_ONLY");
 assert.equal(card.character_evidence.blade_hairs.vein_pattern,"NOT_DESCRIBED_IN_SOURCE");
 assert(/p\.261/.test(card.character_evidence.blade_hairs.gould_source_record));
 assert(card.traits.habit.includes("tuft"));
 assert(card.traits.ligule.includes("membrane"));
 const master=read("optional-refinement-evidence.json");
 assert.deepEqual(master.evidence.find(x=>x.id===card.id&&x.character==="blade_hairs").states,["blade_hairy"]);
 assert(!master.evidence.some(x=>x.id===card.id&&x.character==="blade_venation"),
   "A user page without venation cannot create invented vein evidence");
 assert(row.learner_diagnostic_checks.every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));
}
console.log("PASS: Gould p261 Lindheimer blade hairs, dimensions, flora provenance and unknown veins recorded");

// Gould p.127 historical Koeleria treatment is accepted Rostraria cristata.
// Sphenopholis genus follows lower on the PAGE but is NOT this taxon's
// floral description or key. Preserve historical anther anomaly as HOLD.
{
 const rows=source.additional_species_treatments.filter(x=>x.species_id==="rostraria-cristata");
 assert.equal(rows.length,1,"Rostraria Gould intake duplicated");
 const row=rows[0];
 assert.deepEqual(row.printed_pages,[127]);
 assert.equal(row.taxon,"Koeleria gerardii (Vill.) Shinners");
 assert.equal(row.accepted_current_taxon,"Rostraria cristata (L.) Tzvelev");
 assert.deepEqual(row.synonyms_as_printed,[
  "Koeleria gerardii (Vill.) Shinners","Koeleria phleoides (Vill.) Pers."
 ]);
 assert.equal(row.common_name_as_printed,"ANNUAL KOELERIA");
 assert.equal(row.intake_batch,"20261118");
 assert.equal(row.observations.length,9);
 const byChar=new Map(row.observations.map(x=>[x.character,x]));
 assert.deepEqual(byChar.get("panicle").length_cm_mostly,[2,7]);
 assert.deepEqual(byChar.get("spikelets_florets").florets_per_spikelet,[4,6]);
 assert.deepEqual(byChar.get("ligule_blade").blade_width_mm,[1,5]);
 assert.equal(byChar.get("glumes_lemmas_awns").lemma_awn_max_mm,2);
 assert.deepEqual(byChar.get("anthers_chromosome").anther_length_mm_as_printed,[5,8]);
 assert.equal(byChar.get("anthers_chromosome").anther_measurement_status,
  "HOLD_IMPLAUSIBLE_RELATIVE_TO_SPIKELET_VERIFY_SOURCE");
 assert(row.cautions.some(x=>x.includes("Sphenopholis")&&x.includes("NOT")));
 const candidate=read("hays-candidates.json").candidates.find(x=>x.id==="rostraria-cristata");
 assert(candidate,"Rostraria research candidate missing");
 assert(candidate.aliases.some(x=>x.includes("Koeleria gerardii")));
 assert(candidate.aliases.some(x=>x.includes("Koeleria phleoides")));
 assert(candidate.source_refs.some(x=>x.includes("printed p.127")));
 assert.equal(candidate.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
 assert(row.learner_diagnostic_checks.every(x=>x.source.includes("Gould")&&x.url.startsWith("https://")));
}
console.log("PASS: Gould p127 old Koeleria names mapped to Rostraria, Sphenopholis separated, anther held");
 
// Rostraria exact ligule (>8 mm) contradiction in Lindheimer's muhly
// field walk: execute production advanced-exclusion helper and verify
// only this species + this answer is affected. Approximate Gould p.127
// ligule 1 mm corroborated by NSW/Vic Flora 0.5–1.5 mm; other options
// remain positive-only. Existing research candidate/credits untouched.
{
 const vm=require("node:vm");
 const master=read("optional-refinement-evidence.json");
 const sourceRow=master.evidence.find(e=>e.id==="rostraria-cristata"&&e.character==="ligule_length");
 assert(sourceRow&&sourceRow.length_mm[0]===0.5&&sourceRow.length_mm[1]===1.5);
 assert.equal(sourceRow.source_status,"READY_SUPPLEMENTAL_CONDITIONAL");
 const state={refineEvidenceMap:{"rostraria-cristata":[structuredClone(sourceRow)],
    "muhlenbergia-lindheimeri":[...master.evidence.filter(e=>e.id==="muhlenbergia-lindheimeri"&&e.character==="ligule_length").map(e=>structuredClone(e))]},
    refineSelected:{},refineCharacters:master.characters,selected:{},
    refineEvidenceOptionKeys:new Set(master.evidence.flatMap(e=>e.states.map(v=>e.character+":"+v)))};
 const helperStart=html.indexOf("function refinementEvidence(");
 const helperEnd=html.indexOf("function refinementSection(",helperStart);
 assert(helperStart>0&&helperEnd>helperStart);
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(helperStart,helperEnd),ctx);
 for(const choice of ["tiny","short","medium","long"]){
  state.refineSelected.ligule_length=choice;
  const r=vm.runInContext("verifiedAdvancedConflict({id:'rostraria-cristata'})",ctx);
  assert.equal(r.length,choice==="long"?1:0,"Rostraria "+choice);
  if(choice==="long")assert.equal(r[0].policy,"EXACT_ROSTRARIA_SHORT_LIGULE_VS_LONG");
  assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-lindheimeri'}).length",ctx),choice==="tiny"||choice==="short"?1:0,
    "Lindheimer separate published 8–15 mm interval, "+choice);
 }
 assert.deepEqual(sourceRow.states,["tiny","short"],"Master refinements preserved");
}
console.log("PASS: exact Rostraria 1-mm ligule excludes only >8 mm, without changing source master");


// 2026-11-18 pine muhly field pilot: photographed Gould exact species
// account printed p.265, separated from adjacent M. metcalfei (currently
// considered M. rigida by Kew) and following M. pauciflora. Test that
// source-documented overlap does NOT manufacture a false exclusion.
{
 const pine=source.additional_species_treatments.filter(x=>x.species_id==="muhlenbergia-dubia");
 const met=source.additional_species_treatments.filter(x=>x.species_id==="muhlenbergia-metcalfei");
 assert.equal(pine.length,1,"Gould pine muhly account duplicated");
 assert.equal(met.length,1,"Gould Metcalfe historical account duplicated");
 assert.deepEqual(pine[0].printed_pages,[265]);
 assert.deepEqual(met[0].printed_pages,[265]);
 assert.equal(pine[0].common_name_as_printed,"PINE MUHLY");
 const pineObs=Object.fromEntries(pine[0].observations.map(x=>[x.character,x]));
 const metObs=Object.fromEntries(met[0].observations.map(x=>[x.character,x]));
 assert.deepEqual(pineObs.blade.width_mm,[1,2]);
 assert.equal(pineObs.blade.blade_shape,"involute");
 assert.deepEqual(pineObs.ligule.length_mm,[4,12]);
 assert.deepEqual(pineObs.panicle.length_cm,[10,30]);
 assert.deepEqual(pineObs.lemma_awn_and_callus.awn_length_mm_usually,[0,4]);
 assert.deepEqual(metObs.sheath_and_ligule.ligule_length_mm,[4,15]);
 assert.deepEqual(metObs.spikelets_and_awns.awn_mm_mostly,[5,10]);
 assert(/rigida/i.test(met[0].current_taxonomy));
 assert(pine[0].cautions.some(x=>x.includes("DO NOT exclude")||x.includes("do NOT exclude")));
 assert(pine[0].cautions.some(x=>x.includes("metcalfei")));
 const card=read("species-d2.json").find(x=>x.id==="muhlenbergia-dubia");
 assert(card);
 assert.deepEqual(card.traits.head,["long_narrow_panicle"]);
 assert.equal(card.character_evidence.gould_1975_p265.documented_blade_shape,"involute (rolled inward)");
 assert.deepEqual(card.character_evidence.gould_1975_p265.documented_ligule_mm,[4,12]);
 assert.equal(card.photos.length,2,"Never alter existing pine muhly photos during key QA");
 const vm=require("node:vm");
 const master=read("optional-refinement-evidence.json");
 const srcWidth=master.evidence.find(x=>x.id===card.id&&x.character==="blade_width");
 const srcLigule=master.evidence.find(x=>x.id===card.id&&x.character==="ligule_length");
 const srcShape=master.evidence.find(x=>x.id===card.id&&x.character==="blade_shape");
 assert.deepEqual(srcWidth.width_mm,[1,2]);
 assert.deepEqual(srcLigule.length_mm,[4,10]);
 assert.deepEqual(srcShape.states,["flat","inrolled"]);
 const state={
  gouldSource:source,
  refineEvidenceMap:{[card.id]:[structuredClone(srcWidth),structuredClone(srcLigule),structuredClone(srcShape)]},
  refineSelected:{},refineCharacters:master.characters,selected:{}
 };
 const begin=html.indexOf("/* Texas grama field pilot: Gould 1975 pp.342–343");
 const end=html.indexOf("state.refineEvidenceOptionKeys=new Set",begin);
 const hs=html.indexOf("function refinementEvidence(");
 const he=html.indexOf("function refinementSection(",hs);
 assert(begin>=0&&end>begin&&he>hs,"Need runtime Gould overlays and source helpers");
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(begin,end)+html.slice(hs,he),ctx);
 const pineWidth=state.refineEvidenceMap[card.id][0];
 const pineLigule=state.refineEvidenceMap[card.id][1];
 assert.deepEqual(Array.from(pineWidth.states),["thread","narrow"]);
 assert.deepEqual(Array.from(pineLigule.length_mm),[4,12]);
 assert(/ONLY at the shared 2 mm/.test(pineWidth.additional_state_sources.narrow.note));
 for(const [choice,supported,excluded] of [["thread",true,false],["narrow",true,false],["medium",false,true],["broad",false,true]]){
  state.refineSelected={blade_width:choice};
  assert.equal(vm.runInContext("hasAllDocumentedRefinements({id:'muhlenbergia-dubia'})",ctx),supported,"pine width "+choice);
  assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-dubia'}).length",ctx),excluded?1:0,"pine width conflict "+choice);
 }
 for(const [choice,supported,excluded] of [["tiny",false,true],["short",false,true],["medium",true,false],["long",true,false]]){
  state.refineSelected={ligule_length:choice};
  assert.equal(vm.runInContext("hasAllDocumentedRefinements({id:'muhlenbergia-dubia'})",ctx),supported,"pine ligule "+choice);
  assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-dubia'}).length",ctx),excluded?1:0,"pine ligule conflict "+choice);
 }
 state.refineSelected={blade_width:"narrow",blade_shape:"folded",ligule_length:"long"};
 assert.equal(vm.runInContext("hasAllDocumentedRefinements({id:'muhlenbergia-dubia'})",ctx),false,
  "Pine remains unresolved for Lindheimer's V-fold, not a sourced positive match");
 assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-dubia'}).length",ctx),0,
  "Do not falsely exclude pine from coarse 2–5 mm, V-fold and >8 mm picks");
 assert.deepEqual(srcWidth.states,["thread"],"Original FNA width state unchanged");
 assert.deepEqual(srcLigule.length_mm,[4,10],"Original FNA ligule measurement unchanged");
}
console.log("PASS: Gould pine p265 overlap, shared 2-mm endpoint, metcalfei taxonomy hold and no false exclusion");

// Gaping panicum exact-source test: Gould photographed p.458 and
// species continuation, independently corroborated by H&L p.65.
{
 const hians=source.additional_species_treatments.filter(x=>x.species_id==="steinchisma-hians");
 assert.equal(hians.length,1,"Do not duplicate existing Gould gaping panicum intake");
 assert.equal(hians[0].printed_page,458);
 assert(hians[0].taxon_as_printed.startsWith("Panicum hians"));
 assert.equal(hians[0].observations.find(x=>x.character==="ligule").height_mm_approx,0.5);
 const candidate=read("hays-candidates.json").candidates.find(x=>x.id==="steinchisma-hians");
 assert(candidate);
 const regional=candidate.details.find(x=>x.part==="ligule");
 assert(regional.source.includes("Hagenbuch & Lemke 2015"));
 assert(regional.description.includes("no more than 0.5 mm"));
 const vm=require("node:vm");
 const state={gouldSource:source,candidateManifest:[candidate],refineEvidenceMap:{},
   refineCharacters:[],refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const start=html.indexOf("function refinementEvidence(");
 const finish=html.indexOf("function refinementSection(",start);
 assert(start>0&&finish>start);
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(start,finish),ctx);
 for(const choice of ["tiny","short","medium","long"]){
  state.refineSelected.ligule_length=choice;
  const conflicts=vm.runInContext("verifiedAdvancedConflict({id:'steinchisma-hians'})",ctx);
  assert.equal(conflicts.length,choice==="long"?1:0,"Steinchisma ligule contrast "+choice);
  if(choice==="long")assert.equal(conflicts[0].policy,"EXACT_STEINCHISMA_TINY_LIGULE_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 state.candidateManifest=[];
 assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'steinchisma-hians'}).length",ctx),0,
  "Missing regional corroboration cannot exclude");
 state.candidateManifest=[candidate];
 state.gouldSource={additional_species_treatments:[]};
 assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'steinchisma-hians'}).length",ctx),0,
  "Missing photographed Gould p458 cannot exclude");
}
console.log("PASS: Steinchisma 0.5-mm true ligule excludes long-only with preserved source provenance");

// Owner's photographed Gould p.56 account, previously extracted in the
// pampas character supplement. Compare full true hair ligule height
// against >8 mm only, preserving shorter-band source disagreements.
{
 const src=read("gould-pampasgrass-character-supplement.json");
 const gould=src.evidence.find(e=>e.id==="cortaderia-selloana"&&e.character==="ligule_length");
 const candidate=read("hays-candidates.json").candidates.find(e=>e.id==="cortaderia-selloana");
 assert.equal(src.printed_page,56);
 assert.deepEqual(gould.length_mm,[3,5]);
 assert(gould.source_disagreement);
 assert(candidate.details.find(e=>e.part==="ligule").description.includes("FNA gives 1–2 mm"));
 const vm=require("node:vm");
 const state={candidateManifest:[candidate],refineEvidenceMap:{"cortaderia-selloana":[
  {...gould,additional_state_sources:{medium:structuredClone(gould)}}
 ]},refineCharacters:[],refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const sourceSpecies={id:"cortaderia-selloana",
   exact_pampas_glume_hair_absence:structuredClone(src.exact_glume_hair_absence)};
 const start=html.indexOf("function refinementEvidence(");
 const finish=html.indexOf("function refinementSection(",start);
 assert(start>0&&finish>start);
 const ctx=vm.createContext({state,sourceSpecies});
 vm.runInContext(html.slice(start,finish),ctx);
 for(const choice of ["tiny","short","medium","long"]){
  state.refineSelected.ligule_length=choice;
  const conflicts=vm.runInContext("verifiedAdvancedConflict(sourceSpecies)",ctx);
  assert.equal(conflicts.length,choice==="long"?1:0,"Pampas true ligule "+choice);
  if(choice==="long")assert.equal(conflicts[0].policy,"EXACT_PAMPAS_SOURCE_UPPER5_VS_LONG8");
 }
 state.refineSelected.ligule_length="long";
 state.candidateManifest=[];
 assert.equal(vm.runInContext("verifiedAdvancedConflict(sourceSpecies)",ctx).length,0,
   "Do not exclude without independent comparison source");
 state.candidateManifest=[candidate];
 sourceSpecies.exact_pampas_glume_hair_absence=null;
 assert.equal(vm.runInContext("verifiedAdvancedConflict(sourceSpecies)",ctx).length,0,
   "Do not exclude without Gould p56 source overlay");
}
console.log("PASS: Pampas hair-ligule source extrema reject only long >8 mm");

// Owner photograph Gould p269: Muhlenbergia schreberi vs adjacent M. repens.
// Preserve all printed differential structures and exclude only measured
// true ligule >8 mm when exact Gould + H&L p55 source records are present.
{
 const nimble=source.additional_species_treatments.filter(x=>x.species_id==="muhlenbergia-schreberi");
 const creeping=source.additional_species_treatments.filter(x=>x.species_id==="muhlenbergia-repens");
 assert.equal(nimble.length,1);assert.equal(creeping.length,1);
 assert.deepEqual(nimble[0].observations.find(x=>x.character==="leaf_blades").width_mm_mostly,[1,3]);
 assert.equal(nimble[0].observations.find(x=>x.character==="ligule").max_mm,0.5);
 assert.deepEqual(nimble[0].observations.find(x=>x.character==="lemmas_and_awns").awn_length_mm,[1.5,5]);
 assert.deepEqual(creeping[0].observations.find(x=>x.character==="ligule").length_mm,[0.5,1]);
 assert(creeping[0].observations.find(x=>x.character==="growth").details.includes("SCALY CREEPING RHIZOMES"));
 assert.equal(creeping[0].classification_decision.action,"SOURCE_ARCHIVE_ONLY_NOT_CURRENT_LAB_169_ROSTER");
 const original=read("species-d2.json").filter(x=>x.id==="muhlenbergia-schreberi");
 assert.equal(original.length,1);
 const nimbleS=original[0];
 assert.equal(nimbleS.photos.length,4,"Preserve original nimblewill photos");
 assert.equal(nimbleS.character_evidence.gould_1975_p269.status,
    "EXACT_OWNER_PHOTOGRAPHED_PRIMARY_PUBLISHED_DESCRIPTION_NOT_SPECIMEN");
 assert(!read("hays-candidates.json").candidates.some(x=>x.id==="muhlenbergia-repens"));
 const vm=require("node:vm");
 const state={gouldSource:source,refineEvidenceMap:{},refineCharacters:[],
   refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const begin=html.indexOf("function refinementEvidence(");
 const end=html.indexOf("function refinementSection(",begin);
 assert(begin>0&&end>begin);
 const ctx=vm.createContext({state,nimbleS});
 vm.runInContext(html.slice(begin,end),ctx);
 for(const choice of ["tiny","short","medium","long"]){
   state.refineSelected.ligule_length=choice;
   const found=vm.runInContext("verifiedAdvancedConflict(nimbleS)",ctx);
   assert.equal(found.length,choice==="long"?1:0,"Nimblewill ligule "+choice);
   if(choice==="long")assert.equal(found[0].policy,"EXACT_NIMBLEWILL_MAX_HALF_MM_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 state.gouldSource={additional_species_treatments:[]};
 assert.equal(vm.runInContext("verifiedAdvancedConflict(nimbleS)",ctx).length,0,
    "Cannot hard exclude when exact Gould evidence is absent");
 state.gouldSource=source;
 const copied=structuredClone(nimbleS);
 copied.character_evidence.ligule_ciliate_membrane_visual_choice=null;
 ctx.nimbleS=copied;
 assert.equal(vm.runInContext("verifiedAdvancedConflict(nimbleS)",ctx).length,0,
    "Cannot hard exclude without independent H&L evidence");
}
console.log("PASS: Gould p269 nimblewill/creeping muhly kept distinct; nimblewill long-only ligule conflict proven");

// Gould pp.190-191: red lovegrass is separate from purple and silver
// lovegrasses; true ligule NOT measured by Gould, but H&L p.49 gives
// <0.5 mm ciliate fringe. Exclude ONLY >8 mm true ligule.
{
 const gould=source.additional_species_treatments.filter(x=>x.species_id==="eragrostis-secundiflora");
 assert.equal(gould.length,1,"No duplicate Gould red lovegrass treatment");
 assert.deepEqual(gould[0].printed_pages,[190,191]);
 const obs=new Map(gould[0].observations.map(x=>[x.character,x]));
 assert.deepEqual(obs.get("leaf_blades").width_mm,[2,2.5]);
 assert.deepEqual(obs.get("spikelets").floret_count,[10,24]);
 assert.deepEqual(obs.get("lemmas").length_mm,[1.6,2.4]);
 assert.equal(obs.get("ligule").gould_status,"NOT_REPORTED");
 assert(gould[0].cautions.some(x=>x.includes("Eragrostis spectabilis")));
 const s=read("species-d2.json").find(x=>x.id==="eragrostis-secundiflora");
 assert(s&&s.photos.length===5,"Preserve five existing red lovegrass photographs");
 assert(s.character_evidence.gould_1975_pp190_191.distinct_source_ligule.includes("<0.5 mm"));
 assert(s.character_evidence.lemma.disagreement.includes("1.6–2.4"),"Preserve lemma concept hold");
 const vm=require("node:vm");
 const state={gouldSource:source,refineEvidenceMap:{},refineCharacters:[],
   refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const begin=html.indexOf("function refinementEvidence(");
 const end=html.indexOf("function refinementSection(",begin);
 assert(begin>0&&end>begin);
 const ctx=vm.createContext({state,s});
 vm.runInContext(html.slice(begin,end),ctx);
 for(const choice of ["tiny","short","medium","long"]){
   state.refineSelected.ligule_length=choice;
   const conflicts=vm.runInContext("verifiedAdvancedConflict(s)",ctx);
   assert.equal(conflicts.length,choice==="long"?1:0,"Red lovegrass true ligule "+choice);
   if(choice==="long")assert.equal(conflicts[0].policy,"EXACT_RED_LOVEGRASS_TINY_LIGULE_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 state.gouldSource={additional_species_treatments:[]};
 assert.equal(vm.runInContext("verifiedAdvancedConflict(s)",ctx).length,0,"No Gould means no exclusion");
 state.gouldSource=source;
 const copy=structuredClone(s);
 delete copy.character_evidence.gould_1975_pp190_191;
 ctx.s=copy;
 assert.equal(vm.runInContext("verifiedAdvancedConflict(s)",ctx).length,0,"No independent H&L guard means no exclusion");
}
console.log("PASS: Gould red lovegrass pp190-191 and H&L p49 long-only ligule exclusion");

// Gould photographed p304 S. asper var drummondii vs other varieties
// and following separate S. neglectus. Only independent H&L p64
// species ligule <0.5 mm contradicts >8 mm true ligule choice.
{
 const rows=source.additional_species_treatments.filter(x=>x.species_id==="sporobolus-compositus"&&x.printed_pages?.includes(304));
 assert.equal(rows.length,1,"No duplicate Gould p304 variety intake");
 const row=rows[0],obs=new Map(row.observations.map(x=>[x.character,x]));
 assert.equal(row.current_variety,"Sporobolus compositus var. drummondii (Trin.) Kartesz & Gandhi");
 assert.deepEqual(obs.get("culm_base_diameter").width_mm_typical,[1,2]);
 assert.deepEqual(obs.get("terminal_sheath_width_folded").width_mm_typical,[0.8,2]);
 assert.deepEqual(obs.get("leaf_blades").width_mm_mostly,[1,2]);
 assert.deepEqual(obs.get("flowerhead").primary_branches,[8,18]);
 assert.deepEqual(obs.get("spikelets").length_mm,[4,5]);
 assert.equal(obs.get("ligule").gould_status,"NOT_REPORTED_IN_THIS_VARIETY_ACCOUNT");
 assert(row.cautions.some(x=>x.includes("Sporobolus neglectus")));
 const all=read("species-c3.json"),one=all.filter(x=>x.id==="sporobolus-compositus");
 assert.equal(one.length,1);
 assert.equal(one[0].photos.length,1,"Preserve pre-existing gallery untouched");
 assert(one[0].traits.head.includes("long_narrow_panicle"));
 assert(one[0].character_evidence.hagenbuch_lemke_2015_p64_exact_ligule.true_ligule_max_mm_exclusive===0.5);
 assert(one[0].character_evidence.gould_1975_p304_var_drummondii.taxon_scope_hold.includes("cannot hard-exclude"));
 const vm=require("node:vm");
 const state={gouldSource:source,refineEvidenceMap:{},refineCharacters:[],refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const begin=html.indexOf("function refinementEvidence(");
 const end=html.indexOf("function refinementSection(",begin);
 assert(begin>0&&end>begin);
 const ctx=vm.createContext({state,oneSpecies:one[0]});
 vm.runInContext(html.slice(begin,end),ctx);
 for(const pick of ["tiny","short","medium","long"]){
   state.refineSelected.ligule_length=pick;
   const conflicts=vm.runInContext("verifiedAdvancedConflict(oneSpecies)",ctx);
   assert.equal(conflicts.length,pick==="long"?1:0,"Composite dropseed true ligule "+pick);
   if(pick==="long")assert.equal(conflicts[0].policy,"EXACT_COMPOSITUS_HILL_COUNTRY_TINY_LIGULE_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 state.gouldSource={additional_species_treatments:[]};
 assert.equal(vm.runInContext("verifiedAdvancedConflict(oneSpecies)",ctx).length,0,"Missing exact historic variety crosswalk must preserve unresolved");
 state.gouldSource=source;
 const dropped=structuredClone(one[0]);
 delete dropped.character_evidence.hagenbuch_lemke_2015_p64_exact_ligule;
 ctx.oneSpecies=dropped;
 assert.equal(vm.runInContext("verifiedAdvancedConflict(oneSpecies)",ctx).length,0,"Missing independent vegetative source cannot hard-exclude");
}
console.log("PASS: Gould p304 historical variety correctly scoped; independent H&L p64 true ligule rules out >8 mm only");

// Gould p209 exact Tridens albescens account: <=0.5mm true inner
// fringed membrane, corroborated independently by H&L p65. Test
// only long >8mm conflict; avoid false exclusions for 1–4mm blades.
{
 const rows=source.additional_species_treatments.filter(x=>x.species_id==="tridens-albescens");
 assert.equal(rows.length,1,"Exactly one Gould white tridens p209 account");
 const g=rows[0];assert.deepEqual(g.printed_pages,[209]);
 const obs=new Map(g.observations.map(x=>[x.character,x]));
 assert.equal(obs.get("true_ligule").length_mm_usual_max,0.5);
 assert.equal(obs.get("true_ligule").structure,"minute fringed membrane");
 assert.deepEqual(obs.get("leaf_blades").width_mm,[1,4]);
 assert.deepEqual(obs.get("spikelets").floret_count,[4,11]);
 assert.deepEqual(obs.get("lemmas").lower_lemma_length_mm,[3,4]);
 const existing=read("species-d4.json").filter(x=>x.id==="tridens-albescens");
 assert.equal(existing.length,1,"White tridens scored item preserved");
 assert.equal(existing[0].photos.length,2,"Both pre-existing photos preserved");
 assert(existing[0].traits.habit.includes("rhizome"),"Prior rhizome scoring kept");
 assert(existing[0].character_evidence.ligule_ciliate_minute_membrane_regional.reported_states.includes("tiny ligule under 0.5 mm"));
 const vm=require("node:vm");
 const state={gouldSource:source,refineEvidenceMap:{},refineCharacters:[],
   refineSelected:{},selected:{},refineEvidenceOptionKeys:new Set()};
 const begin=html.indexOf("function refinementEvidence("),end=html.indexOf("function refinementSection(",begin);
 assert(begin>0&&end>begin);
 const ctx=vm.createContext({state,species:existing[0]});
 vm.runInContext(html.slice(begin,end),ctx);
 for(const choice of ["tiny","short","medium","long"]){
   state.refineSelected.ligule_length=choice;
   const found=vm.runInContext("verifiedAdvancedConflict(species)",ctx);
   assert.equal(found.length,choice==="long"?1:0,"White tridens true ligule "+choice);
   if(choice==="long")assert.equal(found[0].policy,"EXACT_TRIDENS_ALBESCENS_MAX_HALF_MM_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 state.gouldSource={additional_species_treatments:[]};
 assert.equal(vm.runInContext("verifiedAdvancedConflict(species)",ctx).length,0,"Gould p209 absent means no exclusion");
 state.gouldSource=source;
 const other=structuredClone(existing[0]);delete other.character_evidence.ligule_ciliate_minute_membrane_regional;
 ctx.species=other;
 assert.equal(vm.runInContext("verifiedAdvancedConflict(species)",ctx).length,0,"H&L corroboration absent means no exclusion");
}
console.log("PASS: Gould Tridens p209 true ligule excludes over8mm only, other states intact");


// Gould photographed p212 historical parent Tridens muticus account now
// preserves its non-scoring context separately from modern T. elongata.
{
 const rough=source.additional_species_treatments.filter(x=>x.species_id==="tridentopsis-elongata"&&x.printed_page===213);
 assert.equal(rough.length,1,"Do not duplicate the existing p213 rough tridens species source");
 const parent=rough[0].historical_parent_aggregate_addendum_p212;
 assert.equal(parent.printed_page,212);
 assert.equal(parent.strict_scope,"PARENT_AGGREGATE_ACCOUNT_NOT_INDEPENDENT_MODERN_ELONGATA_DIAGNOSIS");
 assert.equal(parent.source_status,"OWNER_PHOTOGRAPHED_GOULD_P212_COMPLETE_HISTORICAL_PARENT_ACCOUNT_NON_SCORING");
 const o=new Map(parent.observations.map(x=>[x.character,x]));
 assert.deepEqual(o.get("ligule").length_mm,[0.5,1]);
 assert.deepEqual(o.get("panicle").width_mm,[3,8]);
 assert.deepEqual(o.get("spikelets").floret_count,[5,11]);
 assert(rough[0].historical_couplet_comparison.elongatus_variety.second_glume_veins.includes(7));
 assert(parent.neighboring_account_boundary.p212_above.includes("LONGSPIKE TRIDENS"));
 assert(parent.neighboring_account_boundary.p213_variety_key.includes("ROUGH TRIDENS"));
 assert.equal(parent.score_change.startsWith("NONE"),true);
 assert.equal(parent.media_changes.startsWith("NONE"),true);
 const trial=read("hays-candidates.json").candidates.find(x=>x.id==="tridentopsis-elongata");
 assert(trial&&trial.status==="RESEARCH_CANDIDATE_NOT_RELEASED");
 const scored=read("species-d4.json");
 assert(!scored.some(x=>x.id==="tridentopsis-elongata"),"Preserve rough tridens trial boundary");
}
console.log("PASS: Gould p212 historic muticus parent kept distinct from rough tridens p213 and longspike tridens");

// Eriochloa sericea 2026-11-18 Gould p.433 species account + exact
// H&L p.50 CILIATE LIGULE upper bound of 1 mm. Gould itself DOES NOT
// state the ligule length. The neighboring Panicum genus starts lower
// on p.433; preserve source and anatomical scopes. Execute actual
// advanced source scorer rather than assuming saved Gould text scores.
{
 const rows=source.additional_species_treatments.filter(x=>x.species_id==="eriochloa-sericea");
 assert.equal(rows.length,1,"Duplicate Gould Eriochloa sericea p.433 intake");
 const row=rows[0];
 assert.deepEqual(row.printed_pages,[433]);
 assert.equal(row.printed_figure,232);
 assert.equal(row.common_name_as_printed,"TEXAS CUPGRASS");
 assert.equal(row.intake_batch,"20261118");
 const get=k=>row.observations.find(x=>x.character===k);
 assert.deepEqual(get("growth").height_cm,[50,100]);
 assert.deepEqual(get("leaf_blades").width_mm,[2,3]);
 assert.deepEqual(get("flowering_branches").branch_count,[4,10]);
 assert.deepEqual(get("flowering_branches").branch_length_cm,[1.5,3]);
 assert.deepEqual(get("inflorescence_axis_hairs").hair_length_mm,[2,4]);
 assert.deepEqual(get("spikelet_floral").spikelet_length_mm,[3.6,4.2]);
 assert.equal(get("chromosome").chromosome_2n,54);
 assert.equal(get("true_ligule").source_separation,"GOULD_UNREPORTED_HAGENBUCH_LEMKE_VERIFIED_INDEPENDENT_SOURCE");
 assert(row.cautions.some(x=>x.includes("Panicum")&&x.includes("do not belong")));
 assert(row.cautions.some(x=>x.includes("not described by Gould")||x.includes("No ligule length is described by Gould")));
 const cupgrass=read("species-d2.json").find(x=>x.id==="eriochloa-sericea");
 assert(cupgrass);
 assert.equal(cupgrass.character_evidence.gould_1975_p433.status,
  "EXACT_OWNER_PHOTOGRAPHED_PRIMARY_SPECIES_TREATMENT_NOT_SPECIMEN_VOUCHER");
 assert.equal(cupgrass.photos.length,4,"Preserve prior cupgrass gallery");
 const master=read("optional-refinement-evidence.json");
 const original=master.evidence.find(x=>x.id===cupgrass.id&&x.character==="ligule_length");
 const lindheimer=master.evidence.find(x=>x.id==="muhlenbergia-lindheimeri"&&x.character==="ligule_length");
 assert(original&&lindheimer);
 assert.deepEqual(original.length_mm,[null,1]);
 assert.deepEqual(original.states,["tiny"]);
 assert.equal(original.pdf_printed_page,50);
 assert(original.source.includes("Hagenbuch & Lemke"));
 const vm=require("node:vm");
 const state={
   refineEvidenceMap:{[cupgrass.id]:[structuredClone(original)],
     "muhlenbergia-lindheimeri":[structuredClone(lindheimer)]},
   refineSelected:{},refineCharacters:master.characters,selected:{},refineEvidenceOptionKeys:new Set()
 };
 const helperStart=html.indexOf("function refinementEvidence(");
 const helperEnd=html.indexOf("function refinementSection(",helperStart);
 assert(helperStart>0&&helperEnd>helperStart);
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(helperStart,helperEnd),ctx);
 for(const choice of ["tiny","short","medium","long"]){
  state.refineSelected.ligule_length=choice;
  const conflicts=vm.runInContext("verifiedAdvancedConflict({id:'eriochloa-sericea'})",ctx);
  assert.equal(conflicts.length,choice==="long"?1:0,"Cupgrass ligule "+choice);
  if(choice==="long")assert.equal(conflicts[0].policy,"EXACT_ERIOCHLOA_MAX_1MM_LIGULE_VS_LONG");
 }
 state.refineSelected.ligule_length="long";
 assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-lindheimeri'}).length",ctx),0,
  "Correct Lindheimer long ligule must stay eligible");
 state.refineEvidenceMap[cupgrass.id][0].pdf_printed_page=null;
 assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'eriochloa-sericea'}).length",ctx),0,
  "Missing exact source provenance cannot prove cupgrass exclusion");
 assert.deepEqual(original.length_mm,[null,1],"Historical numeric source interval retained");
}
console.log("PASS: Gould p433 Eriochloa anatomy and H&L p50 short ligule excludes only the >8 mm match");

// Texas grama Gould pp.342–343: preserve printed unit conflict and proper adjacent account boundary.
const texasGramaGould342=source.additional_species_treatments.find(x=>x.species_id==="bouteloua-rigidiseta");
const texasGramaCard342=read("species-c1.json").find(x=>x.id==="bouteloua-rigidiseta");
assert.deepEqual(texasGramaGould342.printed_pages,[342,343]);
assert.equal(texasGramaGould342.observations.find(x=>x.character==="habit_culms").rhizomes,"NOT_EXPLICITLY_ADDRESSED_ON_PP342_343");
assert.deepEqual(texasGramaGould342.observations.find(x=>x.character==="leaf_blades").width_mm,[1,2]);
assert.equal(texasGramaGould342.observations.find(x=>x.character==="ligule").states[0],"hair_fringe");
assert.equal(texasGramaGould342.observations.find(x=>x.character==="branch_length_printed_unit_conflict").status,"INTERNAL_SOURCE_UNIT_CONFLICT_HOLD_NO_NUMERIC_BRANCH_SCORE");
assert.deepEqual(texasGramaGould342.observations.find(x=>x.character==="branch_rachis").length_mm,[4,7]);
assert.deepEqual(texasGramaGould342.observations.find(x=>x.character==="reduced_upper_floret").awn_length_mm,[5,10]);
assert.equal(texasGramaGould342.source_boundary_holds[0].taxon,"Bouteloua aristidoides");
assert(texasGramaCard342.character_evidence.gould_1975_pages_342_343);
assert.equal(texasGramaCard342.photos.length,3);
assert(texasGramaCard342.traits.head.includes("short_side_racemes"));
assert(texasGramaCard342.traits.habit.includes("tuft"));
assert(texasGramaCard342.traits.ligule.includes("hairs"));

// Texas grama field-pilot: distinct specific head plus literature-backed broad unilateral alternatives.
assert.deepEqual(texasGramaCard342.traits.head,["short_side_racemes","one_sided","many_one_sided"]);
assert(!texasGramaCard342.traits.head.includes("side_oats"));
assert(texasGramaCard342.character_evidence.flowerhead_field_pilot_20261117.source_url.includes("powo.science.kew.org"));
assert(/seven-plus|seven/i.test(texasGramaGould342.field_pilot_resolution.scope));
assert(html.includes('["side_oats","Dangling oat-like branches along a long stalk"'));
assert(html.includes('["short_side_racemes","Short, bristly, bell-shaped branches"'));
assert(html.includes('["one_sided","Spikelets on one side of each branch"'));

 // Field pilot: the same measured interval supports BOTH adjacent options
 // at exactly 2 mm. Execute the actual runtime overlay and scorer helpers.
 {
  const vm=require("node:vm");
  const master=read("optional-refinement-evidence.json");
  const original=master.evidence.find(e=>e.id==="bouteloua-rigidiseta"&&e.character==="blade_width");
  assert.deepEqual(original.width_mm,[1,2]);
  const state={
   refineEvidenceMap:{"bouteloua-rigidiseta":[structuredClone(original)]},
   refineSelected:{},refineCharacters:master.characters,selected:{}
  };
  const start=html.indexOf("/* Texas grama field pilot: Gould 1975 pp.342–343");
  const end=html.indexOf("state.refineEvidenceOptionKeys=new Set",start);
  assert(start>=0&&end>start);
  const helperStart=html.indexOf("function refinementEvidence(");
  const helperEnd=html.indexOf("function refinementSection(",helperStart);
  const ctx=vm.createContext({state});
  vm.runInContext(html.slice(start,end)+html.slice(helperStart,helperEnd),ctx);
  assert.deepEqual(Array.from(state.refineEvidenceMap["bouteloua-rigidiseta"][0].states),["thread","narrow"]);
  for(const choice of ["thread","narrow","medium","broad"]){
   state.refineSelected.blade_width=choice;
   const supported=vm.runInContext('hasAllDocumentedRefinements({id:"bouteloua-rigidiseta"})',ctx);
   const conflicts=vm.runInContext('verifiedAdvancedConflict({id:"bouteloua-rigidiseta"}).length',ctx);
   assert.equal(supported,["thread","narrow"].includes(choice),choice);
   assert.equal(conflicts,["medium","broad"].includes(choice)?1:0,choice);
  }
  assert.deepEqual(original.states,["thread"],"Historical master untouched");
  assert(html.includes("Thread-thin · up to 2 mm"));
 }
 console.log("PASS: Texas grama 1–2 mm blade supports shared boundary; wider intervals remain conflicts");


// Lindheimer's muhly 5 mm field estimate: the primary Hill Country
// interval [2,5] overlaps both beginner bands exactly at 5 mm.
// Test the *real runtime overlay and ranking helpers*, not just text.
{
 const vm=require("node:vm");
 const master=read("optional-refinement-evidence.json");
 const original=master.evidence.find(e=>e.id==="muhlenbergia-lindheimeri"&&e.character==="blade_width");
 assert(original,"Lindheimer blade-width record is missing");
 assert.deepEqual(original.width_mm,[2,5]);
 assert.deepEqual(original.states,["narrow"]);
 assert(/usually 2–3 mm, occasionally about 5 mm/i.test(original.note));
 const state={
  refineEvidenceMap:{"muhlenbergia-lindheimeri":[structuredClone(original)]},
  refineSelected:{blade_width:"narrow"},refineCharacters:master.characters,
  selected:{}
 };
 const start=html.indexOf("/* Texas grama field pilot: Gould 1975 pp.342–343");
 const end=html.indexOf("state.refineEvidenceOptionKeys=new Set",start);
 const helperStart=html.indexOf("function refinementEvidence(");
 const helperEnd=html.indexOf("function refinementSection(",helperStart);
 assert(start>=0&&end>start&&helperEnd>helperStart);
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(start,end)+html.slice(helperStart,helperEnd),ctx);
 const row=state.refineEvidenceMap["muhlenbergia-lindheimeri"][0];
 assert.deepEqual(Array.from(row.states),["narrow","medium"]);
 assert.equal(row.additional_state_sources.medium.conditional,true);
 assert(/ONLY at the shared 5 mm endpoint/.test(row.additional_state_sources.medium.note));
 for(const choice of ["thread","narrow","medium","broad"]){
  state.refineSelected.blade_width=choice;
  const supported=vm.runInContext('hasAllDocumentedRefinements({id:"muhlenbergia-lindheimeri"})',ctx);
  const conflicts=vm.runInContext('verifiedAdvancedConflict({id:"muhlenbergia-lindheimeri"}).length',ctx);
  assert.equal(supported,["narrow","medium"].includes(choice),"Lindheimer width "+choice);
  assert.equal(conflicts,choice==="broad"?1:0,"Lindheimer width conflict "+choice);
 }
 assert.deepEqual(original.states,["narrow"],"Historical source evidence master untouched");
}
console.log("PASS: Lindheimer 2–5 mm leaf supports narrow and medium at 5 mm only");

// Lindheimer's muhly 2026-11-18 leaf-vein pilot: no source-verified vein
// option exists in the published exact-species description (H&L p.54).
// Every vein selection must remain an UNKNOWN evidence gap rather than a
// conflict. UI must tell a beginner why Supported can drop to zero.
{
 const vm=require("node:vm");
 const master=read("optional-refinement-evidence.json");
 const species=read("species-c3.json").find(x=>x.id==="muhlenbergia-lindheimeri");
 const evidence=master.evidence.filter(x=>x.id===species.id);
 assert(!evidence.some(x=>x.character==="blade_venation"),
  "Do not invent Lindheimer blade veins without verified exact-source evidence");
 const state={refineEvidenceMap:{[species.id]:structuredClone(evidence)},refineSelected:{},
  refineCharacters:master.characters,selected:{},refineEvidenceOptionKeys:new Set()};
 const start=html.indexOf("function refinementEvidence(");
 const end=html.indexOf("function refinementSection(",start);
 const advStart=html.indexOf("const advancedExclusionPolicy=");
 assert(start>=0&&advStart>start&&end>advStart);
 const ctx=vm.createContext({state});
 vm.runInContext(html.slice(start,end),ctx);
 assert.equal(vm.runInContext("hasAllDocumentedRefinements({id:'muhlenbergia-lindheimeri'})",ctx),true);
 for(const v of ["pale_midvein","prominent_midvein","raised_midvein","raised_ribs"]){
  state.refineSelected.blade_venation=v;
  assert.equal(vm.runInContext("hasAllDocumentedRefinements({id:'muhlenbergia-lindheimeri'})",ctx),false,
   "Missing verified vein evidence must remain unknown: "+v);
  assert.equal(vm.runInContext("verifiedAdvancedConflict({id:'muhlenbergia-lindheimeri'}).length",ctx),0,
   "Missing vein evidence cannot rule out Lindheimer: "+v);
 }
 assert(html.includes("Vein descriptions are incomplete for many grasses."),
  "Vein question must explain optional evidence gaps");
 assert(html.includes("they moved to Still possible, NOT ruled out."),
  "Zero-supported results must distinguish missing vein evidence from a contradiction");
}
console.log("PASS: four Lindheimer vein options remain unknown, never exclusions; beginner gap notice visible");

// Field pilot 2026-11-18: Texas grama's short wedge-shaped flowerhead is a
// source-documented architectural contradiction for three research additions.
// All other flowerhead choices retain historical positive-only safeguards.
{
 const oldFinal=read("source-scored-final-three-20261116.json");
 const oldFocused=read("focused-identity-review-20261116.json");
 const pampas=oldFinal.admissions.find(x=>x.id==="cortaderia-selloana");
 const proso=oldFocused.admissions.find(x=>x.id==="panicum-miliaceum");
 const hybrid=read("hays-candidates.json").candidates.find(x=>x.id==="lolium-x-boucheanum");
 const texas=read("species-c1.json").find(x=>x.id==="bouteloua-rigidiseta");
 assert(pampas&&proso&&hybrid&&texas);
 assert.deepEqual(pampas.core_traits.head,["pampas_plume"]);
 assert.deepEqual(proso.core_traits.head,["compact","airy"]);
 assert.equal(hybrid.status,"RESEARCH_CANDIDATE_NOT_RELEASED");
 assert(/TAXONOMIC CONCEPT HOLD/.test(hybrid.unresolved),"Hybrid taxonomic hold must remain");
 const begin=html.indexOf("function coreChoiceStatus(s,key,val){");
 const finish=html.indexOf("// Progressive key display:",begin);
 assert(begin>=0&&finish>begin,"Exact-source contrast runtime not found");
 const make=new Function("state","refinementMatches",
  html.slice(begin,finish)+";return {coreChoiceStatus,currentResults};");
 const records=[
  {id:texas.id,common:texas.common,scientific:texas.scientific,traits:texas.traits,range:texas.range},
  ...[pampas,proso].map(x=>({id:x.id,common:x.common||x.scientific,
   scientific:x.scientific,traits:x.core_traits,positiveOnlyCoreKeys:x.positive_only_core_keys,range:"FAIL"})),
  {id:hybrid.id,common:hybrid.common,scientific:hybrid.scientific,traits:{head:[],habit:[],ligule:[],awns:[]},range:"UNVERIFIED",trial:true}
 ];
 const state={species:records,selected:{head:"short_side_racemes",habit:null,ligule:null,awns:null},
  refineSelected:{},refineOnlyDocumented:false,range:"all",query:""};
 const key=make(state,()=>[]);
 assert.deepEqual(key.currentResults().map(x=>x.s.id),["bouteloua-rigidiseta"]);
 for(const species of records.slice(1)){
  assert.equal(key.coreChoiceStatus(species,"head","short_side_racemes"),"conflict",species.id);
 }
 state.selected.head="airy";
 assert.equal(key.coreChoiceStatus(records[2],"head","airy"),"match");
 assert.equal(key.coreChoiceStatus(records[1],"head","airy"),"unknown",
  "Pampas retains positive-only handling outside exact Texas grama contrast");
 state.selected.head=null;
 assert.equal(key.currentResults().length,4,"No exclusion without the specific flowerhead");
}
console.log("PASS: only exact short grama branch contrast excludes pampas, proso and hybrid ryegrass; hold retained");


