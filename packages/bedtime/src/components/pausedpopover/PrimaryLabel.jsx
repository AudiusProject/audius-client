

import styles from './PrimaryLabel.module.css'

const messages = {
  label: 'Looking for more like this?'
}

// TODO: proptypes
// interface PrimaryLabelProps {
//   className?: string
// }

const PrimaryLabel = ({
  className
}) => {
  return (
    <div className={cn(styles.container, className)}>
      {messages.label}
    </div>
  )
}

export default PrimaryLabel
