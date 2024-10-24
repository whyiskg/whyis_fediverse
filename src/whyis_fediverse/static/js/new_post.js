import {Vue, axios, createApp} from '../../../dist/whyis.js';

import post from './selections.js';


function randomID() {
    var result =  Math.random().toString().replace('0.','');
    console.log(result);
    return result;
}

function newPost(uri) {
    return {
	"@context" : [
	    "https://www.w3.org/ns/activitystreams",
	    {
		"np" : "http://www.nanopub.org/nschema#",
		"schema" : "http://schema.org/"
	    }
	],
	"id" : uri,
	"type" : "Note",
	"attributedTo" : {
	    "id" : USER.uri,
	    "name" : USER.name
	},
	"to" : [],
	"attachment" : [],
	"content" : "",
	"inReplyTo" : null,
	"summary" : null,
	"context" : null,
	"published" : null,
	"name" : null
    };
}

async function uploadFiles(fileList, uri){
    let distrData = new FormData();
    let distrLDs = Array(fileList.length);
    distrData.append('upload_type', 'http://purl.org/dc/dcmitype/Collection')

    // append the files to FormData
    Array
	.from(Array(fileList.length).keys())
	.map(function(x, idx) {
	    let new_file_name = (idx+1).toString();
	    let upload_name = fileList[x].name;
	    distrData.append(new_file_name, fileList[x], new_file_name);
	    distrLDs[x] = {
		'id': `${uri}/${new_file_name}`,
		"type": [],
		'url': `${uri}/${new_file_name}`,
		"mediaType": fileList[x].type,
		'http://www.w3.org/2000/01/rdf-schema#label': fileList[x].name,
	    }
	    if (fileList[x].type.indexOf("image") > -1) {
		distrLDs[x].type.push("Image");
		distrLDs[x].type.push("schema:ImageObject");		
	    } else if (fileList[x].type.indexOf("video") > -1) {
		distrLDs[x].type.push("Video");
		distrLDs[x].type.push("schema:VideoObject");		
	    } else {
		distrLDs[x].type.push("Document");
		distrLDs[x].type.push("schema:DigitalDocument");		
	    }
	    console.log(distrLDs[x]);
	});
    console.log(distrLDs);

    const baseUrl = `${window.location.origin}/about?uri=${uri}`;
    await axios.post( baseUrl,
		      distrData,
		      {
			  headers: {
			      'Content-Type': 'multipart/form-data',
			  },
		      }
		    )
    return distrLDs;
}

export default Vue.component('fedi-new-post', {
    name: "fedi-new-post",
    props:{
        entity: {
            type: String,
            require: false
        },
	inReplyTo: {
	    type: String,
	    require: false
	}
    },
    inject : ['selection'],
    data() {
	let id = randomID();
	let uri = `${LOD_PREFIX}/note/${id}`;
	console.log(uri, id);
        return {
	    user: USER,
            otherArgs: null,
	    attachments: [],
            embeds: {},
            hovers: {},
	    id : id,
	    uri : uri,
	    post: newPost(uri),
        }
    },
    template: `
    <md-card>
        <md-card-content>
          <md-field>
            <label>What's on your mind?</label>
            <md-textarea v-on:keyup.enter.exact="sendPost()"
                         v-model="post.content" 
                         md-autogrow>
            </md-textarea>
            <md-button class="md-icon-button" @click="sendPost()">
              <md-icon  md-size="small">send</md-icon>
            </md-button>
            </md-field>
              <div style="position:relative"
                   v-for="item in selection"
                   v-bind:key="item"
                   v-on:mouseenter="hovers[item] = true"
                   v-on:mouseleave="hovers[item] = false" >
                <div v-html="embeds[item]"></div>
                <md-button style="position: absolute; right: 0; top: 0; "
                           class="md-icon-button md-raised md-mini"
                           v-on:click="unselect(item)">
                  <md-icon>delete</md-icon>
                </md-button>
              </div>
            <md-field id="media_upload">
              <label>Add media</label>
              <md-file name="media_upload" ref="attachments" v-model="attachments" multiple />
            </md-field>
        </md-card-content>
    </md-card>
    `,
    watch: {
        selection: {
            handler: function (val, oldVal) {
                this.selection.forEach(this.getEmbed)
            },
            deep: true
        }
    },
    components: {
    },
    methods: {
        unselect : function (uri) {
            if (this.selection.includes(uri)) {
                var index = this.selection.indexOf(uri)
                this.selection.splice(index, 1)
            }
        },
        select : function (uri) {
            if (!this.selection.includes(uri)) {
                this.selection.push(uri)
            }
        },
        async getEmbed(uri) {
            console.log(uri)
            if (this.embeds[uri] == null) {
                this.embeds[uri] = "embeds_loading"
                const result = await axios.get(`${ROOT_URL}about`,
                                               { params: {
                                                   view: "embed",
                                                   uri: uri,
                                               }
                                               })
                this.embeds[uri] = result.data
                this.$forceUpdate()
            }
        },

        async loadPage() {
        },
        async scrollBottom () {
            if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                console.log(this.post);
            }
        },
	async sendPost() {
	    console.log(this.post);
	    console.log(this)
	    if (this.inReplyTo != null) {
		this.post.inReplyTo = this.inReplyTo;
	    }
	    let now = new Date();
	    this.post.published = now.toISOString();
            this.post.context = this.selection;
	    
	    let attachments = this.$refs.attachments.$refs.inputFile.files;
	    let old_id = this.id;
	    let post = this.post;

	    this.id = randomID();
	    this.uri = `${LOD_PREFIX}/note/${this.id}`;
	    this.post = newPost(this.uri);
	    this.attachments = null;
	    
	    if (attachments.length >0) {
		const collectionURI = `${LOD_PREFIX}/media/${old_id}`;
		console.log(collectionURI);
		post.attachment = await uploadFiles(attachments,
						    collectionURI);
	    }
	    console.log(post);
	    let metadata = JSON.stringify(post);
	    const baseUrl = `${window.location.origin}/pub`;
	    
    	    await axios.post( baseUrl, metadata, {
		headers: {
		    'Content-Type': 'application/ld+json'
		}
	    });
	    //this.selection.length = 0;
	    if (this.inReplyTo == null) {
		window.location.href = `${window.location.origin}/about?uri=${post.id}`;
	    }
	}
    },
    async mounted (){
        if (this.entity != null && this.inReplyTo == null) {
            this.select(this.entity)
        }
        this.selection.forEach(this.getEmbed)
    },
    async unmounted() {
    },
    created(){
    }
})
