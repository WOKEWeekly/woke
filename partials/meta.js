import Head from 'next/head';

export default class Head extends Component {
  render(){
    return (
      <Head>
        <title>{this.props.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
    )
  }
}