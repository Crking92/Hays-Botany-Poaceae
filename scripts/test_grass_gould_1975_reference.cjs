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

