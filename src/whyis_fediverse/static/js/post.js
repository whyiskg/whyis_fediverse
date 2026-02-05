import dayjs from '//unpkg.com/dayjs@1.11.13/esm';
import relativeTime from '//unpkg.com/dayjs@1.11.13/esm/plugin/relativeTime';
dayjs.extend(relativeTime);


import selectable from './selectable.js';
import {axios} from '../../../dist/whyis.js';
import {registerComponent} from './vue_app.js';

const component = {
    name: "fedi-post",
    props:{
        value: {
            type: Object,
            require: true
        },
	expanded: {
	    type: Boolean,
	    default: false
	}
    },
    data() {
        return {
            replies: [],
            loading: false,
            loadError: false,
            otherArgs: null,
            pageSize: 20,
        }
    },
    template: `
    <div class="card mb-3">
      <div class="card-header">
        <div class="small text-muted">
          <a :href="value.attributedTo.view" class="text-decoration-none">
            <span class="rounded-circle bg-secondary text-white d-inline-flex align-items-center justify-content-center me-2"
                  style="width:32px; height:32px;">
              {{value.attributedTo.name[0]}}
            </span>
            <strong>{{value.attributedTo.name}}</strong> <small>(@{{value.attributedTo.id.split('/').pop()}})</small>
          </a>
          <br/>
          <small><a :href="value.view" class="text-decoration-none">{{published}}</a></small>
        </div>
        <div class="fw-semibold mt-2" v-if="value.name"><a :href="value.id" class="text-decoration-none">{{value.name}}</a></div>
      </div>
      <div class="card-body" v-html="value.content"></div>
      <div class="card-body pt-0"
           v-if="(value.attachment != null && value.attachment.length != 0) || (value.context != null && value.context.length != 0)">
        <div class="d-flex flex-wrap gap-2">
          <fedi-selectable v-bind:uri="a.id" v-for="a in value.attachment" v-bind:key="a.id" v-html="a.embed">
          </fedi-selectable>
          <fedi-selectable v-bind:uri="a.id" v-for="a in value.context" v-bind:key="a.id" v-html="a.embed">
          </fedi-selectable>
        </div>
      </div>
    </div>
    `,
    watch: {
    },
    components: {
    },
    computed: {
	published: function() {
	    return dayjs(this.value.published).fromNow();
	},
	// a computed getter
	images: function () {
	    console.log(this.value.attachment);
	    // `this` points to the vm instance
	    let result = this.value.attachment.filter(function(x) {x.type.indexOf('Image') >= 0});
	    console.log(result);
	    return result;
	}
    },
    methods: {
        async loadPage() {
            // non-page sized results means we've reached the end.
            if (this.results.length % this.pageSize > 0)
                return
            const result = await axios.get(`${ROOT_URL}about`,
                                           { params: {
                                               view: "comments",
                                               uri: this.entity,
                                               limit: this.pageSize,
                                               offset: this.results.length
                                           }
                                           })
            this.results.push(...result.data)
        },
        async scrollBottom () {
            if (Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                await this.loadPage()
            }
        }
    },
    async mounted (){
    },
    async unmounted() {
    },
    created(){
    }
};

export default registerComponent('fedi-post', component);
