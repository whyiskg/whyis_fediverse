import {Vue, axios, createApp} from '../../../dist/whyis.js';
import post from './post.js';
import newPost from './new_post.js';

export default Vue.component('fedi-discussion', {
    name: "fedi-discussion",
    props:{
        entity: {
            type: String,
            require: true
        }
    },
    data() {
        return {
            results: [],
            loading: false,
            loadError: false,
            otherArgs: null,
            pageSize: 20,
        }
    },
    template: `
    <div style="max-width:500px">
        <spinner :loading="loading" text='Loading...' v-if="loading"/>
        <div v-else>
            <fedi-new-post style="margin-top:0.5em; border-radius:0.5em"
                           :entity="entity">
            </fedi-new-post>
            <fedi-post style="margin-top:0.5em; border-radius:0.5em"
                  v-for="(post, index) in results" 
                  :key="post.id" 
                  :entity="entity" 
                  v-bind:value="post">
            </fedi-post>
        </div>
    </div>`,
    watch: {
    },
    components: {
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
        window.addEventListener("scroll", this.scrollBottom)
        this.loading = true
        await this.loadPage()
        this.loading = false
    },
    async unmounted() {
        window.removeEventListener("scroll", this.scrollBottom)
    },
    created(){
    }
})
