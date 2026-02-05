import dayjs from '//unpkg.com/dayjs@1.11.13/esm';
import {registerComponent} from './vue_app.js';

const component = {
    name: "fedi-selection",
    data() {
        return {
            selected: []
        }
    },
    template: `
    <div>
    <slot></slot>
    </div>
    `,
    provide () {
        return { selection : this.selected }
    },
    methods: {
        add(item) {
            if (!this.selected.includes(item))
                this.selected.push(item);
        },
        remove(item) {
            var idx = myArray.indexOf(item)
            if (idx >= 0) this.selected.splice(idx, 1)
        },
        reset() {
            this.selected.length = 0
        }
    },
};

export default registerComponent('fedi-selection', component);
