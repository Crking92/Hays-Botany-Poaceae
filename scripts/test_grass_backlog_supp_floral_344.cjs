'use strict';
// Source-anchored Issue #344 reproductive supplemental batch: 149 matched records + holds.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const pack=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../site/visual-key-lab/optional-refinement-evidence.json'),'utf8'));
const expected={
  "bothriochloa-bladhii|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A392701-1/general-information",
    "lane": "A"
  },
  "bothriochloa-bladhii|spikelet_position": {
    "states": [
      "paired",
      "reduced_partner"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A392701-1/general-information",
    "lane": "A"
  },
  "bothriochloa-bladhii|floral_hair_position": {
    "states": [
      "below_spikelet"
    ],
    "url": "https://keys.lucidcentral.org/keys/v3/AusGrass/key/AusGrass/Media/Html/BOTHRIOC/BOTBLA.HTML",
    "lane": "A"
  },
  "bothriochloa-longipaniculata|spikelet_position": {
    "states": [
      "paired"
    ],
    "url": "https://www.nrcs.usda.gov/plantmaterials/stpmcpg13519.pdf",
    "lane": "A"
  },
  "hopia-obtusa|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77077132-1/general-information",
    "lane": "D"
  },
  "eragrostis-cilianensis|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A1104599-2/general-information",
    "lane": "A"
  },
  "eragrostis-cilianensis|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A1104599-2/general-information",
    "lane": "A"
  },
  "eragrostis-curtipedicellata|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A400988-1/general-information",
    "lane": "A"
  },
  "eragrostis-curtipedicellata|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A400988-1/general-information",
    "lane": "A"
  },
  "eragrostis-hirsuta|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A93109-2/general-information",
    "lane": "A"
  },
  "muhlenbergia-dubia|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630304",
    "lane": "B"
  },
  "muhlenbergia-dubia|lemma_texture": {
    "states": [
      "smooth"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630304",
    "lane": "B"
  },
  "muhlenbergia-paniculata|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "url": "https://fieldguide.mt.gov/speciesDetail.aspx?elcode=PMPOA5A010",
    "lane": "B"
  },
  "muhlenbergia-paniculata|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://fieldguide.mt.gov/speciesDetail.aspx?elcode=PMPOA5A010",
    "lane": "B"
  },
  "muhlenbergia-utilis|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:164921-2/general-information",
    "lane": "B"
  },
  "muhlenbergia-x-involuta|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:164804-2/general-information",
    "lane": "B"
  },
  "muhlenbergia-x-involuta|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:164804-2/general-information",
    "lane": "B"
  },
  "muhlenbergia-x-involuta|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:164804-2/general-information",
    "lane": "B"
  },
  "briza-minor|lemma_texture": {
    "states": [
      "shiny_hard"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Briza%20minor.html",
    "lane": "B"
  },
  "briza-minor|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Briza%20minor.html",
    "lane": "B"
  },
  "chloris-andropogonoides|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "eragrostis-intermedia|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Eragrostis%20intermedia",
    "lane": "A"
  },
  "eragrostis-lugens|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A93132-2/general-information",
    "lane": "A"
  },
  "eragrostis-minor|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A401317-1/general-information",
    "lane": "A"
  },
  "eragrostis-minor|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A401317-1/general-information",
    "lane": "A"
  },
  "eragrostis-secundiflora|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A322572-2/general-information",
    "lane": "A"
  },
  "eragrostis-spectabilis|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A93125-2/general-information",
    "lane": "A"
  },
  "eragrostis-superba|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A402021-1/general-information",
    "lane": "A"
  },
  "dichanthelium-oligosanthes|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:79378-2/general-information",
    "lane": "B"
  },
  "dichanthelium-pedicellatum|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Dichanthelium%20pedicellatum",
    "lane": "B"
  },
  "chloris-andropogonoides|true_lemma_awn": {
    "states": [
      "short"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "chloris-andropogonoides|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "chloris-x-subdolichostachya|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:396032-1/general-information",
    "lane": "B"
  },
  "chloris-x-subdolichostachya|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:396032-1/general-information",
    "lane": "B"
  },
  "chloris-x-subdolichostachya|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:396032-1/general-information",
    "lane": "B"
  },
  "chloris-verticillata|lemma_texture": {
    "states": [
      "smooth"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?taxon=17600",
    "lane": "B"
  },
  "chloris-verticillata|true_lemma_awn": {
    "states": [
      "long"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?taxon=17600",
    "lane": "B"
  },
  "chloris-verticillata|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?taxon=17600",
    "lane": "B"
  },
  "chloris-virgata|spikelet_position": {
    "states": [
      "one_side",
      "two_rows"
    ],
    "url": "https://biorepo.neonscience.org/portal/taxa/index.php?taxon=136000",
    "lane": "B"
  },
  "eleusine-indica|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://www.burkeherbarium.org/imagecollection/taxon.php?Taxon=Eleusine+indica",
    "lane": "B"
  },
  "hordeum-murinum|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "url": "https://www.burkeherbarium.org/imagecollection/taxon.php?Taxon=Hordeum+murinum",
    "lane": "B"
  },
  "janochloa-antidotalis|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://keys.lucidcentral.org/keys/v3/AusGrass/key/AusGrass/Media/Html/PANICUM/PANANT.HTML",
    "lane": "B"
  },
  "eragrostis-superba|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://keys.lucidcentral.org/keys/v3/AusGrass/key/AusGrass/Media/Html/ERAGROST/ERASUP.HTML",
    "lane": "A"
  },
  "eragrostis-superba|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://keys.lucidcentral.org/keys/v3/AusGrass/key/AusGrass/Media/Html/ERAGROST/ERASUP.HTML",
    "lane": "A"
  },
  "eragrostis-trichodes|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Eragrostis%20trichodes.html",
    "lane": "A"
  },
  "anatherum-virginicum|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30016735-2/general-information",
    "lane": "A"
  },
  "anatherum-virginicum|spikelet_position": {
    "states": [
      "paired",
      "reduced_partner"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30016735-2/general-information",
    "lane": "A"
  },
  "janochloa-antidotalis|glume_marks": {
    "states": [
      "glabrous"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&taxauthid=1&tid=239881",
    "lane": "B"
  },
  "lolium-multiflorum|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Lolium+multiflorum",
    "lane": "B"
  },
  "lolium-multiflorum|spikelet_position": {
    "states": [
      "two_rows"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&pid=&taxauthid=1&tid=65477",
    "lane": "B"
  },
  "lolium-multiflorum|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&pid=&taxauthid=1&tid=65477",
    "lane": "B"
  },
  "lolium-perenne|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Lolium+perenne",
    "lane": "B"
  },
  "lolium-perenne|spikelet_position": {
    "states": [
      "two_rows"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&pid=&taxauthid=1&tid=65477",
    "lane": "B"
  },
  "lolium-perenne|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=26&pid=&taxauthid=1&tid=65477",
    "lane": "B"
  },
  "munroa-pulchella|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77139483-1/general-information",
    "lane": "B"
  },
  "munroa-pulchella|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77139483-1/general-information",
    "lane": "B"
  },
  "munroa-pulchella|true_lemma_awn": {
    "states": [
      "short"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77139483-1/general-information",
    "lane": "B"
  },
  "munroa-pulchella|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:77139483-1/general-information",
    "lane": "B"
  },
  "anatherum-virginicum|true_lemma_awn": {
    "states": [
      "long"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30016735-2/general-information",
    "lane": "A"
  },
  "anatherum-virginicum|floral_hair_position": {
    "states": [
      "below_spikelet",
      "partner_stalk"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30016735-2/general-information",
    "lane": "A"
  },
  "andropogon-gerardi|floral_hair_position": {
    "states": [
      "below_spikelet",
      "partner_stalk"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A30435428-2/general-information",
    "lane": "A"
  },
  "arundo-donax|true_lemma_awn": {
    "states": [
      "short"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Arundo%20donax.html",
    "lane": "A"
  },
  "avena-fatua|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A391443-1/general-information",
    "lane": "A"
  },
  "avena-fatua|floral_hair_position": {
    "states": [
      "lemma",
      "below_spikelet"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A391443-1/general-information",
    "lane": "A"
  },
  "avena-sativa|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A391732-1/general-information",
    "lane": "A"
  },
  "bouteloua-curtipendula|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607423",
    "lane": "C"
  },
  "bouteloua-gracilis|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "bouteloua-gracilis|true_lemma_awn": {
    "states": [
      "three"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1026047-2/general-information",
    "lane": "C"
  },
  "bouteloua-gracilis|floral_hair_position": {
    "states": [
      "lemma",
      "rachilla"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607426",
    "lane": "C"
  },
  "bouteloua-rigidiseta|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:35641-2/general-information",
    "lane": "C"
  },
  "bouteloua-hirsuta|florets_per_spikelet": {
    "states": [
      "two",
      "several"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427",
    "lane": "C"
  },
  "phalaris-caroliniana|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Phalaris%20caroliniana.html",
    "lane": "B"
  },
  "disakisperma-dubium|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3817421/",
    "lane": "B"
  },
  "disakisperma-dubium|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3817421/",
    "lane": "B"
  },
  "disakisperma-dubium|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3817421/",
    "lane": "B"
  },
  "schizachyrium-scoparium|true_lemma_awn": {
    "states": [
      "long",
      "bent_twisted"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:420956-1/general-information",
    "lane": "B"
  },
  "schizachyrium-scoparium|floral_hair_position": {
    "states": [
      "partner_stalk"
    ],
    "url": "https://www.worldfloraonline.org/taxon/wfo-0000898183",
    "lane": "B"
  },
  "sorghum-halepense|glume_marks": {
    "states": [
      "first_enclosing"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Sorghum%20halepense.html",
    "lane": "B"
  },
  "sorghum-halepense|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pages/Sorghum%20halepense.html",
    "lane": "B"
  },
  "bouteloua-hirsuta|true_lemma_awn": {
    "states": [
      "three"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427",
    "lane": "C"
  },
  "bouteloua-hirsuta|floral_hair_position": {
    "states": [
      "rachilla"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=607427",
    "lane": "C"
  },
  "bouteloua-trifida|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:35652-2/general-information",
    "lane": "C"
  },
  "bouteloua-trifida|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:35652-2/general-information",
    "lane": "C"
  },
  "bouteloua-trifida|true_lemma_awn": {
    "states": [
      "three"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:35652-2/general-information",
    "lane": "C"
  },
  "bouteloua-trifida|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:35652-2/general-information",
    "lane": "C"
  },
  "panicum-repens|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:412908-1/general-information",
    "lane": "C"
  },
  "panicum-repens|lemma_texture": {
    "states": [
      "smooth",
      "shiny_hard"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:412908-1/general-information",
    "lane": "C"
  },
  "panicum-repens|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://www.worldfloraonline.org/taxon/wfo-0000886049",
    "lane": "C"
  },
  "stapfochloa-canterae|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-canterae|lemma_texture": {
    "states": [
      "hairy"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-canterae|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-ciliata|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-ciliata|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60469005-2/general-information",
    "lane": "B"
  },
  "stapfochloa-ciliata|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:60469005-2/general-information",
    "lane": "B"
  },
  "stapfochloa-ciliata|lemma_texture": {
    "states": [
      "hairy"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-ciliata|true_lemma_awn": {
    "states": [
      "short"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "stapfochloa-ciliata|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://abm.ojs.inecol.mx/index.php/abm/article/download/1091/1273?inline=1",
    "lane": "B"
  },
  "eriochloa-sericea|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:402055-1/general-information",
    "lane": "C"
  },
  "leersia-oryzoides|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://gobotany.nativeplanttrust.org/species/leersia/oryzoides/",
    "lane": "C"
  },
  "pappophorum-bicolor|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:413618-1/general-information",
    "lane": "C"
  },
  "pappophorum-bicolor|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:413618-1/general-information",
    "lane": "C"
  },
  "urochloa-fusca|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1156554-2/general-information",
    "lane": "B"
  },
  "urochloa-fusca|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1156554-2/general-information",
    "lane": "B"
  },
  "urochloa-reptans|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:426280-1/general-information",
    "lane": "B"
  },
  "urochloa-reptans|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:426280-1/general-information",
    "lane": "B"
  },
  "urochloa-reptans|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:426280-1/general-information",
    "lane": "B"
  },
  "urochloa-texana|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:943745-1/general-information",
    "lane": "B"
  },
  "urochloa-texana|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://gobotany.nativeplanttrust.org/species/urochloa/texana/",
    "lane": "B"
  },
  "pappophorum-bicolor|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:413618-1/general-information",
    "lane": "C"
  },
  "polypogon-monspeliensis|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1048074-2/general-information",
    "lane": "C"
  },
  "polypogon-monspeliensis|lemma_texture": {
    "states": [
      "smooth"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1048074-2/general-information",
    "lane": "C"
  },
  "polypogon-monspeliensis|true_lemma_awn": {
    "states": [
      "none",
      "short"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:1048074-2/general-information",
    "lane": "C"
  },
  "polypogon-viridis|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:418741-1/general-information",
    "lane": "C"
  },
  "stenotaphrum-secundatum|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:423051-1/general-information",
    "lane": "C"
  },
  "cenchrus-ciliaris|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A395214-1/general-information",
    "lane": "A"
  },
  "cenchrus-ciliaris|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A395214-1/general-information",
    "lane": "A"
  },
  "cenchrus-setaceus|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://vicflora.rbg.vic.gov.au/flora/taxon/63bce897-9220-4efd-a1bf-e3ab8d7f46bd",
    "lane": "A"
  },
  "chasmanthium-latifolium|lemma_texture": {
    "states": [
      "hairy"
    ],
    "url": "https://w3.biosci.utexas.edu/prc/K12/pdf/Chasmanthium%20latifolium",
    "lane": "A"
  },
  "chasmanthium-latifolium|floral_hair_position": {
    "states": [
      "below_spikelet"
    ],
    "url": "https://worldfloraonline.org/taxon/wfo-0000859191",
    "lane": "A"
  },
  "cortaderia-selloana|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A66317-2/general-information",
    "lane": "A"
  },
  "triplasiella-eragrostoides|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://cabezaprieta.org/flora_research/35PhytoN-SWArizFlora6Poaceae.pdf",
    "lane": "C"
  },
  "dichanthelium-acuminatum|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://burkeherbarium.org/imagecollection/taxon.php?Taxon=Dichanthelium+acuminatum",
    "lane": "B"
  },
  "chloris-cucullata|spikelet_position": {
    "states": [
      "one_side"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:395849-1/general-information",
    "lane": "B"
  },
  "chloris-cucullata|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:395849-1/general-information",
    "lane": "B"
  },
  "chloris-cucullata|floral_hair_position": {
    "states": [
      "lemma"
    ],
    "url": "https://powo.science.kew.org/taxon/urn:lsid:ipni.org:names:395849-1/general-information",
    "lane": "B"
  },
  "cortaderia-selloana|true_lemma_awn": {
    "states": [
      "short"
    ],
    "url": "https://plantnet.rbgsyd.nsw.gov.au/cgi-bin/NSWfl.pl?lvl=sp&name=Cortaderia~selloana&page=nswfl",
    "lane": "A"
  },
  "heteropogon-contortus|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404772-1/general-information",
    "lane": "A"
  },
  "heteropogon-contortus|spikelet_position": {
    "states": [
      "paired"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404772-1/general-information",
    "lane": "A"
  },
  "heteropogon-contortus|true_lemma_awn": {
    "states": [
      "long",
      "bent_twisted"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404772-1/general-information",
    "lane": "A"
  },
  "heteropogon-contortus|floral_hair_position": {
    "states": [
      "below_spikelet"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404772-1/general-information",
    "lane": "A"
  },
  "hilaria-belangeri|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://yavapaiplants.extension.arizona.edu/hilaria-belangeri",
    "lane": "A"
  },
  "hilaria-mutica|florets_per_spikelet": {
    "states": [
      "one",
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404949-1/general-information",
    "lane": "A"
  },
  "hilaria-mutica|true_lemma_awn": {
    "states": [
      "short",
      "none"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A404949-1/general-information",
    "lane": "A"
  },
  "megathyrsus-maximus|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A60426565-2/general-information",
    "lane": "A"
  },
  "megathyrsus-maximus|glume_marks": {
    "states": [
      "glabrous"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A60426565-2/general-information",
    "lane": "A"
  },
  "miscanthus-sinensis|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A408768-1/general-information",
    "lane": "A"
  },
  "miscanthus-sinensis|floral_hair_position": {
    "states": [
      "below_spikelet"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A408768-1/general-information",
    "lane": "A"
  },
  "nassella-leucotricha|glume_marks": {
    "states": [
      "glabrous"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630064",
    "lane": "A"
  },
  "nassella-leucotricha|lemma_texture": {
    "states": [
      "hairy"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630064",
    "lane": "A"
  },
  "nassella-tenuissima|glume_marks": {
    "states": [
      "glabrous"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630068",
    "lane": "A"
  },
  "nassella-tenuissima|floral_hair_position": {
    "states": [
      "below_spikelet",
      "lemma"
    ],
    "url": "https://openherbarium.org/portal/taxa/index.php?clid=0&taxauthid=1&tid=630068",
    "lane": "A"
  },
  "phyllostachys-aurea|florets_per_spikelet": {
    "states": [
      "two"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A415983-1/general-information",
    "lane": "A"
  },
  "phyllostachys-aurea|glume_marks": {
    "states": [
      "lower_reduced"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A415983-1/general-information",
    "lane": "A"
  },
  "tridentopsis-buckleyana|florets_per_spikelet": {
    "states": [
      "several"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77160904-1/general-information",
    "lane": "A"
  },
  "tridentopsis-buckleyana|glume_marks": {
    "states": [
      "one_vein"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77160904-1/general-information",
    "lane": "A"
  },
  "tridentopsis-buckleyana|lemma_texture": {
    "states": [
      "hairy"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77160904-1/general-information",
    "lane": "A"
  },
  "tridentopsis-buckleyana|true_lemma_awn": {
    "states": [
      "none"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77160904-1/general-information",
    "lane": "A"
  },
  "tridentopsis-buckleyana|floral_hair_position": {
    "states": [
      "lemma",
      "below_spikelet"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A77160904-1/general-information",
    "lane": "A"
  },
  "zizania-texana|florets_per_spikelet": {
    "states": [
      "one"
    ],
    "url": "https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A271183-2/general-information",
    "lane": "A"
  }
};
assert.equal(Object.keys(expected).length,149);
const idx=new Map(),allowed=new Map(pack.characters.map(c=>[c.id,new Set(c.options.map(o=>o.id))]));
for(const e of pack.evidence){const key=e.id+'|'+e.character;assert(!idx.has(key),'Duplicate '+key);idx.set(key,e)}
for(const [key,v] of Object.entries(expected)){
 const e=idx.get(key);assert(e,'Missing source-backed reproductive row '+key);
 assert.deepEqual([...e.states].sort(),[...v.states].sort(),'States changed '+key);
 assert.equal(e.source_url,v.url,'Source URL drift '+key);assert.equal(e.review_lane,v.lane);
 assert.equal(e.coordination_issue,344);assert.equal(e.source_status,'READY_SUPPLEMENTAL_CONDITIONAL');
 assert.equal(e.source_priority_status,'supplemental_not_overriding_primary');
 assert(e.original_source_citation?.includes(v.url),'Original citation lost '+key);
 assert(e.note?.trim()&&e.source?.includes('exact-species supplemental treatment'),'Anatomical note lost '+key);
 assert(e.states.every(s=>allowed.get(e.character)?.has(s)),'Invalid menu choice '+key);
 assert.equal(e.evidence_level,'PUBLISHED_CHARACTER_NOT_SPECIMEN_CERTIFIED');
}
// Still held: barnyardgrass long awn is on the LOWER STERILE lemma,
 // not yet represented safely by a fertile-vs-sterile option.
 assert(!idx.has('echinochloa-crus-galli|true_lemma_awn'),'Sterile/fertile awn hold incorrectly released');
 // A29/A30 exact taxon and sex/organ verification supersedes these two historical holds.
 const both=idx.get('bothriochloa-longipaniculata|true_lemma_awn');
 assert(both&&both.states.join(',')==='long'&&both.note.includes('FERTILE LEMMA')&&both.supplemental_source_page===37,'Strict B. longipaniculata fertile lemma source lost');
 const z=idx.get('zizania-texana|true_lemma_awn');
 assert(z&&z.states.join(',')==='long,none'&&z.note.includes('PISTILLATE')&&z.note.includes('STAMINATE'),'Texas wild-rice male/female florets collapsed');
assert(![...idx.keys()].some(k=>k.startsWith('lolium-x-boucheanum|')),'Hybrid hold released');
console.log('PASS: 149 verified supplemental reproductive clues, full source links and retained holds');
