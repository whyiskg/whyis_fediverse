import dayjs from '//unpkg.com/dayjs@1.11.13/esm';
import relativeTime from '//unpkg.com/dayjs@1.11.13/esm/plugin/relativeTime';
dayjs.extend(relativeTime);

import selectable from './selectable.js';
import {axios, Vue} from '../../../dist/whyis.js';

const component = {
    name: "fedi-comment",
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
    typing_template: `
    `,
    template: `
    <div class="mt-3 w-100">
      <div class="row g-2" v-if="value.attachment != null && value.attachment.length != 0">
        <fedi-selectable class="col-12 col-md-4" v-bind:uri="a.id" v-for="a in value.attachment" v-bind:key="a.id" v-html="a.embed">
        </fedi-selectable>
      </div>
      <div class="row g-2" v-if="value.context != null && value.context.length != 0">
        <fedi-selectable class="col-12 col-md-4" v-bind:uri="a.id" v-for="a in value.context" v-bind:key="a.id" v-html="a.embed">
        </fedi-selectable>
      </div>
      <div class="d-inline-block bg-light rounded-pill px-3 py-2 mt-2">
        <small>
          <a :href="value.attributedTo.view" class="text-decoration-none">
            <strong>{{value.attributedTo.name}}</strong>
            (@{{value.attributedTo.id.split('/').pop()}})
            {{published}}
          </a>
        </small>
        <div v-html="value.content"></div>
      </div>
      <div v-for="agent in value.typing"
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

export default Vue.component('fedi-comment', component);
