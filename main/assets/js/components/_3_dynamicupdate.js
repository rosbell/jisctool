var data, areas, dataByArea // store the data from the spreadsheet. data is unordered. areas is an ordered list of areas. dataByArea is a map returning all resources for one area
const target = document.querySelector('#acco') // houses the whole accordion
var templateSection = document.querySelector('.template-section') // hidden template element for a section (tag) in the accordion
var templateItem = document.querySelector('.template-link') // template item for a card - for cloning

// for production, switch to Google with fallback
fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vStY6NwY6S8eNyF040MrpzrCEQi3R6Ye39OahLdQKFxl5m4wddWonHYFbiPiXRI1Tr2-R4G81p-0BtS/pub?gid=394150613&single=true&output=tsv') // get the live TSV from Google sheets
// fetch('fallback.json') // get the fallback data from escholar
.then(r=>r.json()) // convert to JSON (contents will still be URL encoded)
.then(json=>{
  
  data = json.map(row=>Object.fromEntries(Object.entries(row).map(pair=>pair.map(decodeURIComponent)))) // apply URL decoding to all string data within the JSON object (which is quite nested hence the complexity)
  areas = [...new Set(data.map(row=>row.area))].sort() // just a list of unique Jisc areas in order
  dataByArea = new Map( areas.map(area=>[area,data.filter(row=>row.area===area)]) ) // a map of all resources for each area

  areas.forEach(area=>{ // build the page area by area

	var sectionClone = templateSection.cloneNode(true) // create a new section copy (virtual)
	sectionClone.style.display='' // unhide the copy (for when it's added to DOM)

	sectionClone.querySelector('.template-tag').textContent=area // set the title for this section of the accordion    
    
    dataByArea.get(area).filter(row=>row.title&&row.url&&row.desc) // filter to only areas with complete data
	.forEach(row=>{ // resource by resource, add the links

		let itemClone = templateItem.cloneNode(true) // create a virtual copy of a card

		itemClone.href=row.url
		itemClone.querySelector('.template-title').textContent=row.title
		itemClone.querySelector('.template-desc').textContent=row.desc
		itemClone.style.display=''

		// console.log(row)
		// console.log(itemClone)

		sectionClone.querySelector('.template-contents').appendChild(itemClone) // add the card to the section
		// console.log(sectionClone)

    })
	
	target.appendChild(sectionClone) // add the section to the accordion

  })

  target.classList.add('accordion','js-accordion') // add the classes in case needed for CSS (removing these in HTML stops init before dynamic population)
  new Accordion(target) // init the accordion
  target.style.display='' // unhide the accordion
    
})