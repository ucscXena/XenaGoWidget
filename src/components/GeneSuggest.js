import React from 'react'
import Input from 'react-toolbox/lib/input';
let XAutosuggest = require('./XAutosuggest');
let {sparseDataMatchPartialField, refGene} = require('../xenaQuery');
let _ = require('../underscore_ext');
let {rxEventsMixin, deepPureRenderMixin} = require('../react-utils');
require('./GeneSuggest.css');
let limit = 8;

// Return the start and end indices of the word in 'value'
// under the cursor position.
function currentWordPosition(value, position) {
    let li = value.slice(0, position).lastIndexOf(' '),
        i = li === -1 ? 0 : li + 1,
        lj = value.slice(position).indexOf(' '),
        j = lj === -1 ? value.length : position + lj;
    return [i, j];
}

// Return the word in 'value' under the cursor position
function currentWord(value, position) {
    let [i, j] = currentWordPosition(value, position);
    return value.slice(i, j);
}

let defaultAssembly = 'hg38';

let renderInputComponent = ({ref, onChange, label, error, ...props}) => (
    <Input
        ref={el => ref(el && el.getWrappedInstance().inputNode)}
        onChange={(value, ev) => onChange(ev)}
        label= {label || 'Add Gene or Position'}
        {...props} >
        <i style={{color: 'red', opacity: error ? 1 : 0}} className='material-icons'>error</i>
    </Input>
);
// Currently we only match against refGene hg38 genes. We could, instead, match
// on specific datasets (probemap, mutation, segmented, refGene), but that will
// require some more work to dispatch the query for each type.
let GeneSuggest = React.createClass({
    mixins: [rxEventsMixin, deepPureRenderMixin],
    componentWillMount() {
        let {host, name} = refGene[this.props.assembly] || refGene[defaultAssembly];
        this.events('change');
        this.change = this.ev.change
            .distinctUntilChanged(_.isEqual)
            .debounceTime(200)
            .switchMap(value => sparseDataMatchPartialField(host, 'name2', name, value, limit)).subscribe(matches => this.setState({suggestions: matches}));
    },
    componentWillUnmount() {
        this.change.unsubscribe();
    },
    onSuggestionsFetchRequested({value}) {
        let position = this.input.selectionStart,
            word = currentWord(value, position);

        if (word !== '') {
            this.ev.change.next(word);
        }
    },
    shouldRenderSuggestions(value) {
        let position = this.input.selectionStart,
            word = currentWord(value, position);
        return word.length > 0;
    },
    onSuggestionsClearRequested() {
        this.setState({suggestions: []});
    },
    getInitialState() {
        return {suggestions: []};
    },
    onChange(ev, {newValue, method}) {
        // Don't update the value for 'up' and 'down' keys. If we do update
        // the value, it gives us an in-place view of the suggestion (pasting
        // the value into the input field), but the drawback is that it moves
        // the cursor to the end of the line. This messes up multi-word input.
        // We could try to preserve the cursor position, perhaps by passing a
        // custom input renderer. But for now, just don't update the value for
        // these events.
        if (method !== 'up' && method !== 'down') {
            this.props.onChange(newValue);
        }
    },
    getSuggestionValue(suggestion) {
        let position = this.input.selectionStart,
            value = this.input.value,
            [i, j] = currentWordPosition(value, position);

        // splice the suggestion into the current word
        return value.slice(0, i) + suggestion + value.slice(j);
    },
    setInput(input) {
        let {inputRef} = this.props;
        this.input = input;
        if (inputRef) {
            inputRef(this.input);
        }
    },
    render() {
        let {onChange} = this,
            {onKeyDown, value = '', label, error} = this.props,
            {suggestions} = this.state;

        return (
            <XAutosuggest
                inputRef={this.setInput}
                suggestions={suggestions}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={this.getSuggestionValue}
                shouldRenderSuggestions={this.shouldRenderSuggestions}
                renderSuggestion={v => <span>{v}</span>}
                renderInputComponent={renderInputComponent}
                inputProps={{value, label, error, onKeyDown, onChange}}/>);
    }
});

module.exports = GeneSuggest;
