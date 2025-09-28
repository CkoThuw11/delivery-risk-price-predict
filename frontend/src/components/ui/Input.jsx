const Input = ({id, name, className, type, value, onChange, placeholder}) => {
    return <>
        <input type={type} id={id} name={name} className={className} placeholder={placeholder} value={value} onChange={onChange}/>
    </>
}

export default Input;