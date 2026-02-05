import {axios} from '../../../dist/whyis.js';
import post from './post.js';
import comment from './comment.js';
import newPost from './new_post.js';
import selections from './selections.js';
import {registerComponent} from './vue_app.js';

const component = {
    name: "fedi-post-view",
    props:{
        object: {
            type: String,
            require: true
        }
    },
    data() {
        return {
            post: null,
            replies: null,
            replyData: {},
            loading: false,
            loadError: false,
            otherArgs: null,
        }
    },
    template: `
    <fedi-selection>
        <spinner :loading="loading" text='Loading...' v-if="loading"/>
        <div v-else class="row g-3">
	    <div class="col-12 col-lg-6 overflow-y-auto">
	      <fedi-post v-if="post != null" 
                         v-bind:value="post">
              </fedi-post>
	    </div>
	    <div class="col-12 col-lg-6 overflow-y-auto">
              <div>
	        <div v-if="replies == null || replies.length == 0" class="border rounded p-4 text-center text-muted">
                  <i class="bi bi-chat-dots fs-1 mb-2 d-block"></i>
                  <div class="fw-semibold">Reply to this thread</div>
                  <div>Reply below to continue this conversation.</div>
                </div>
                <div v-else>
                  <fedi-comment v-if="replyData[reply]"
                             v-for="reply in replies"
                             :key="reply"
                             v-bind:value="replyData[reply]">
                  </fedi-comment>
                </div>
	      </div>
              <div v-for="agent in post.typing"
                   v-bind:key="agent.id"
                   class="d-inline-block bg-light rounded-pill px-3 py-2 mt-2">
                <small>
                  <a :href="agent.view" class="text-decoration-none">
                    <strong>{{agent.name}}</strong>
                    (@{{agent.id.split('/').pop()}})
                    <spinner :loading="true" text=''/>
                  </a>
                </small>
              </div>
              <fedi-new-post v-if="post != null"
                             :inReplyTo="post.id">
              </fedi-new-post>
            </div>
        </div>
    </fedi-selection>`,
    watch: {
    },
    components: {
    },
    methods: {
        async scrollBottom () {
//            if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
//                await this.loadPage()
//            }
        },
	async loadPost() {
	    let response = await axios.get(`${ROOT_URL}about`,
					   {
					       params: {
						   view: "data",
						   uri: this.object
					       }
					   });
	    console.log(response.data);
	    this.post = response.data;
	},
        async loadReplyData(uri) {
	    if (this.post.typing.length > 0) {
		this.loadPost();
	    }
            if (this.replyData[uri] == null || this.replyData[uri]['typing'].length > 0) {
                let response = await axios.get(`${ROOT_URL}about`,
					   {
					       params: {
						   view: "data",
						   uri: uri
					       }
					   });
                this.replyData[uri] = response.data;
            }
            return this.replyData[uri];
        },
	async loadReplies() {
            let response = await axios.get(`${ROOT_URL}about`,
				     {
					 params: {
					     view: "replies",
					     uri: this.object
					 }
				     });
            let that = this;
            await response.data.forEach(function (reply) {
                that.loadReplyData(reply);
            });
	    this.replies = response.data;
	}
    },
    async mounted (){
        this.loading = true
        await Promise.all([this.loadPost(), this.loadReplies()])
        this.loading = false
        this.pollInterval = setInterval(this.loadReplies, 2000)
    },
    async unmounted() {
        window.removeEventListener("scroll", this.scrollBottom)
    }
};

export default registerComponent('fedi-post-view', component);
